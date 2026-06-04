import { useEffect, useRef, useState } from 'react'
import { ImageBackground, Modal, StyleSheet, View } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import RootStackParamList from 'types/RootStackParamList'
import useClient from 'hooks/useClient'
import useUserItem from 'api/useUserItem'
import useTheme from 'hooks/useTheme'
import LinearGradient from 'react-native-linear-gradient'
import Button from 'components/Button'
import Text from 'components/Text'
import Classification from 'components/Classification'
import ticksToTime from 'lib/ticksToTime'
import sortStreams, { sortedStreams } from 'lib/sortStreams'
import CenterLoading from 'components/CenterLoading'
import ListButton from 'components/ListButton'
import { FlashList } from '@shopify/flash-list'
import { useQueryClient } from '@tanstack/react-query'
import useSeasons from 'api/useSeasons'
import usePlayedItem from 'api/usePlayedItem'
import { FasterImageView } from '@candlefinance/faster-image'
import useLocalTrailers from 'api/useLocalTrailers'
import BlurView from '@sbaiahmed1/react-native-blur'
import { Icon } from 'components/Icon'

const Details = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Details'>) => {
  const { item } = route.params

  const video =
    item.Type === 'Movie' ||
    item.Type === 'Episode' ||
    item.Type === 'MusicVideo' ||
    item.Type === 'Video' ||
    item.Type === 'Audio'

  const client = useClient()
  const theme = useTheme()
  const query = useQueryClient()
  const { data, isLoading } = useUserItem(item.Id)
  const seasons = useSeasons(item.Id)
  const played = usePlayedItem(item.Id)
  const trailers = useLocalTrailers(item.Id)

  const [streams, setStreams] = useState<sortedStreams>(null)
  const [videoStream, setVideoStream] = useState<number>(null)
  const [audioStream, setAudioStream] = useState<number>(null)
  const [subtitleStream, setSubtitleStream] = useState<number>(null)
  const [showStreamMenu, setShowStreamMenu] = useState(false)
  const [menu, setMenu] = useState<'Video' | 'Audio' | 'Subtitle'>(null)

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      query.invalidateQueries({ queryKey: ['useritem', item.Id] })
      query.invalidateQueries({ queryKey: ['items', item.ParentId] })
    })
    return unsubscribe
  }, [navigation])

  const streamMenuList = useRef<FlashList<any>>()

  const dismissStreamMenu = () => {
    setShowStreamMenu(false)
  }
  const showMenu = (menu: 'Video' | 'Audio' | 'Subtitle') => {
    setMenu(menu)
    setShowStreamMenu(true)
  }

  useEffect(() => {
    if (video && data) setStreams(sortStreams(data.MediaStreams))
  }, [data])
  useEffect(() => {
    if (streams) {
      if (videoStream === null) setVideoStream(streams.defaults.video)
      if (audioStream === null) setAudioStream(streams.defaults.audio)
      if (subtitleStream === null) setSubtitleStream(streams.defaults.subtitle)
    }
  }, [streams])

  const primaryImage = client.server + '/Items/' + item.Id + '/Images/Primary'
  const backdropImage =
    client.server + '/Items/' + item.Id + '/Images/Backdrop/0'
  const logoImage =
    client.server + '/Items/' + item.Id + '/Images/Logo?format=png'

  return (
    <>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <ImageBackground
          source={{
            uri:
              item.ImageBlurHashes.hasOwnProperty('Backdrop') &&
              item.Type !== 'Episode' &&
              item.Type !== 'Video'
                ? backdropImage
                : primaryImage,
          }}
          resizeMode="cover"
          style={styles.backdrop}
        >
          <View
            style={[
              styles.backdropView,
              item.ImageTags.hasOwnProperty('Logo') && {
                backgroundColor: '#00000040',
              },
            ]}
          >
            <View style={styles.backdropImage}>
              <FasterImageView
                source={{
                  url: logoImage,
                  resizeMode: 'contain',
                }}
                style={{ width: 600, height: 200 }}
              />
            </View>
          </View>
        </ImageBackground>
        {!isLoading && (
          <View style={styles.details}>
            <LinearGradient
              colors={[
                '#00000000',
                item.ImageTags.hasOwnProperty('Logo')
                  ? '#00000040'
                  : '#00000080',
              ]}
              style={styles.detailsGradient}
            >
              <Text style={styles.title} fontWeight={700} numberOfLines={2}>
                {item.Name}
              </Text>
              {!!item.OriginalTitle && item.OriginalTitle != item.Name && (
                <Text style={styles.subtitle} fontWeight={500}>
                  {item.OriginalTitle}
                </Text>
              )}
              {item.Type === 'Episode' && (
                <Text style={styles.subtitle} fontWeight={500}>
                  {item.SeriesName +
                    ' ' +
                    (item.ParentIndexNumber === 0
                      ? 'Special'
                      : 'S' +
                        item.ParentIndexNumber +
                        ':E' +
                        (item.IndexNumberEnd
                          ? item.IndexNumber + '-' + item.IndexNumberEnd
                          : item.IndexNumber))}
                </Text>
              )}
              {item.Type === 'MusicVideo' &&
                'Artists' in item &&
                item.Artists.length > 0 && (
                  <Text style={styles.subtitle} fontWeight={500}>
                    {item.Artists.join(', ')}
                  </Text>
                )}
              <View
                style={{
                  flexDirection: 'row',
                  columnGap: 16,
                  marginTop: 4,
                }}
              >
                {!!item.ProductionYear && <Text>{item.ProductionYear}</Text>}
                {video && !!item.RunTimeTicks && item.RunTimeTicks > 0 && (
                  <Text>{ticksToTime(item.RunTimeTicks, true)}</Text>
                )}
                {!video && data && (
                  <Text>
                    {data.ChildCount +
                      ' Season' +
                      (data.ChildCount !== 1 ? 's' : '')}
                  </Text>
                )}
                {!!item.OfficialRating && (
                  <Classification rating={item.OfficialRating} />
                )}
                {!!streams &&
                  videoStream !== null &&
                  audioStream !== null &&
                  subtitleStream !== null && (
                    <>
                      <Text>{streams.videos[videoStream]?.title}</Text>
                    </>
                  )}
              </View>

              {video ? (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      columnGap: 8,
                      marginTop: 8,
                    }}
                  >
                    {data.UserData.PlaybackPositionTicks > 0 && (
                      <Button
                        icon="resume"
                        filled
                        hasTVPreferredFocus={true}
                        onPress={() => {
                          navigation.push('Player', {
                            item: data,
                            startFrom: data.UserData.PlaybackPositionTicks,
                            streams: {
                              video: videoStream,
                              audio: audioStream,
                              subtitle: subtitleStream,
                            },
                          })
                        }}
                      >
                        Resume from{' '}
                        {ticksToTime(data.UserData.PlaybackPositionTicks)}
                      </Button>
                    )}
                    <Button
                      icon={
                        data.UserData.PlaybackPositionTicks > 0
                          ? 'replay'
                          : 'play_arrow'
                      }
                      filled
                      hasTVPreferredFocus={
                        data.UserData.PlaybackPositionTicks > 0 ? false : true
                      }
                      onPress={() => {
                        navigation.push('Player', {
                          item: data,
                          streams: {
                            video: videoStream,
                            audio: audioStream,
                            subtitle: subtitleStream,
                          },
                        })
                      }}
                    >
                      Play
                    </Button>
                    {/* <Button icon="information" /> */}
                    {data?.LocalTrailerCount > 0 && trailers.data && (
                      <Button
                        icon="theaters"
                        filled
                        onPress={() => {
                          const s = sortStreams(trailers.data[0].MediaStreams)
                          navigation.push('Player', {
                            item: trailers.data[0],
                            streams: {
                              video: s.defaults.video,
                              audio: s.defaults.audio,
                              subtitle: s.defaults.subtitle,
                            },
                          })
                        }}
                      >
                        Trailer
                      </Button>
                    )}
                    {data?.SpecialFeatureCount > 0 && (
                      <Button
                        icon="star"
                        filled
                        onPress={() => {
                          navigation.push('Episodes', {
                            series: data,
                            special: true,
                          })
                        }}
                      >
                        Special Features
                      </Button>
                    )}
                    <Button
                      icon={data?.UserData.Played ? 'done_all' : 'check'}
                      onPress={() => {
                        played.mutate(data.UserData.Played)
                      }}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      columnGap: 8,
                      marginTop: 4,
                    }}
                  >
                    {streams?.videos.length > 1 && (
                      <Button
                        icon="movie"
                        small
                        transparent
                        onPress={() => {
                          showMenu('Video')
                        }}
                      />
                    )}
                    {streams?.audios.length > 0 && (
                      <Button
                        icon="volume_up"
                        small
                        transparent
                        filled
                        onPress={() => {
                          showMenu('Audio')
                        }}
                      >
                        {streams.audios[audioStream]?.title}
                      </Button>
                    )}
                    {streams?.subtitles.length > 0 && (
                      <Button
                        icon={
                          streams.subtitles[subtitleStream]?.sdh
                            ? 'closed_caption'
                            : 'subtitles'
                        }
                        small
                        transparent
                        filled
                        onPress={() => {
                          showMenu('Subtitle')
                        }}
                      >
                        {subtitleStream === -1
                          ? 'None'
                          : streams.subtitles[subtitleStream]?.title}
                      </Button>
                    )}
                  </View>
                </>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    columnGap: 8,
                    marginTop: 8,
                  }}
                >
                  {data?.ChildCount > 1 ? (
                    <Button
                      icon="tv"
                      hasTVPreferredFocus={true}
                      onPress={() => {
                        navigation.push('Season', { series: data })
                      }}
                    >
                      Seasons
                    </Button>
                  ) : (
                    data?.ChildCount > 0 && (
                      <Button
                        icon="tv"
                        hasTVPreferredFocus={true}
                        onPress={() => {
                          navigation.push('Episodes', {
                            season: seasons.data.Items[0],
                            series: data,
                          })
                        }}
                      >
                        Episodes
                      </Button>
                    )
                  )}
                  {data?.SpecialFeatureCount > 0 && (
                    <Button
                      icon="star"
                      filled
                      onPress={() => {
                        navigation.push('Episodes', {
                          series: data,
                          special: true,
                        })
                      }}
                    >
                      Special Features
                    </Button>
                  )}
                  {/*<Button icon="info" filled />*/}
                </View>
              )}
            </LinearGradient>
          </View>
        )}

        {isLoading && <CenterLoading />}
      </View>
      <Modal
        visible={showStreamMenu}
        onRequestClose={dismissStreamMenu}
        transparent={true}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row-reverse',
            backgroundColor: '#00000040',
          }}
        >
          <BlurView
            blurAmount={10}
            blurType="dark"
            style={{
              // backgroundColor: theme.background,
              width: 400,
              paddingHorizontal: 16,
            }}
          >
            {!isLoading && !!streams && (
              <FlashList
                ref={streamMenuList}
                data={
                  menu === 'Video'
                    ? streams.videos
                    : menu === 'Audio'
                      ? streams.audios
                      : streams.subtitles
                }
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={
                  <>
                    <Text
                      style={{
                        fontSize: 24,
                        paddingLeft: 24,
                        paddingVertical: 16,
                      }}
                      fontWeight={700}
                    >
                      Select {menu}
                    </Text>
                    {menu === 'Subtitle' && (
                      <ListButton
                        title="None"
                        iconRight="subtitles_off"
                        filled
                        transparent
                        hasTVPreferredFocus={subtitleStream === -1}
                        onPress={() => {
                          setSubtitleStream(-1)
                          dismissStreamMenu()
                        }}
                      />
                    )}
                  </>
                }
                ListFooterComponent={<View style={{ height: 16 }} />}
                renderItem={({ item, index }) => (
                  <ListButton
                    title={item.title}
                    subtitle={item.name}
                    iconRight={
                      item.sdh
                        ? 'closed_caption'
                        : item.forced
                          ? 'language'
                          : null
                    }
                    filled
                    transparent
                    hasTVPreferredFocus={
                      (menu === 'Video' && item.index === videoStream) ||
                      (menu === 'Audio' && item.index === audioStream) ||
                      (menu === 'Subtitle' && item.index === subtitleStream)
                    }
                    onPress={() => {
                      if (menu === 'Video') setVideoStream(item.index)
                      if (menu === 'Audio') setAudioStream(item.index)
                      if (menu === 'Subtitle') setSubtitleStream(item.index)
                      dismissStreamMenu()
                    }}
                    onFocus={() => {
                      streamMenuList.current.scrollToIndex({
                        index: index,
                        viewPosition: 0.5,
                        animated: true,
                      })
                    }}
                  />
                )}
                estimatedItemSize={76}
                showsVerticalScrollIndicator={false}
              />
            )}
          </BlurView>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  backdropView: {
    flex: 1,
    alignItems: 'center',
  },
  backdropImage: {
    flex: 1,
    paddingTop: 100,
    height: 400,
  },
  details: {
    flex: 1,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  detailsGradient: {
    paddingHorizontal: 64,
    paddingBottom: 16,
    paddingTop: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
  },
})

export default Details
