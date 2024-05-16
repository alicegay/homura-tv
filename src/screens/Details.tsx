import { useEffect, useRef, useState } from 'react'
import {
  FlatList,
  Image,
  ImageBackground,
  Modal,
  StyleSheet,
  View,
} from 'react-native'
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
import { users } from 'jellyfin-api'
import { useQueryClient } from '@tanstack/react-query'
import useSeasons from 'api/useSeasons'

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

  const [streams, setStreams] = useState<sortedStreams>(null)
  const [videoStream, setVideoStream] = useState<number>(null)
  const [audioStream, setAudioStream] = useState<number>(null)
  const [subtitleStream, setSubtitleStream] = useState<number>(null)
  const [showStreamMenu, setShowStreamMenu] = useState(false)
  const [menu, setMenu] = useState<'Video' | 'Audio' | 'Subtitle'>(null)

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

  const primaryExists = 'Primary' in item.ImageBlurHashes
  const backdropExists = 'Backdrop' in item.ImageBlurHashes
  const logoExists = 'Logo' in item.ImageBlurHashes
  const primaryImage =
    client.server +
    '/Items/' +
    item.Id +
    '/Images/Primary?' +
    (primaryExists ? item.ImageBlurHashes.Primary[0] : '')
  const backdropImage =
    client.server +
    '/Items/' +
    item.Id +
    '/Images/Backdrop/0?' +
    (backdropExists ? item.ImageBlurHashes.Backdrop[0] : '')
  const logoImage =
    client.server +
    '/Items/' +
    item.Id +
    '/Images/Logo?' +
    (logoExists ? item.ImageBlurHashes.Logo[0] : '')

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
              <Image
                source={{ uri: logoImage }}
                width={600}
                height={200}
                resizeMode="contain"
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
                      : 'S' + item.ParentIndexNumber + ':E' + item.IndexNumber)}
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
                  marginTop: 12,
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
                      <Text>{streams.audios[audioStream]?.title}</Text>
                      {subtitleStream !== -1 && (
                        <Text>{streams.subtitles[subtitleStream].title}</Text>
                      )}
                    </>
                  )}
              </View>

              {video ? (
                <View
                  style={{
                    flexDirection: 'row',
                    columnGap: 8,
                    marginTop: 16,
                  }}
                >
                  {data.UserData.PlaybackPositionTicks > 0 && (
                    <Button
                      icon="play"
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
                        ? 'reload'
                        : 'play'
                    }
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
                  <Button
                    icon={data?.UserData.Played ? 'check-all' : 'check'}
                    onPress={() => {
                      if (data.UserData.Played) {
                        users.playedItemsDel(client, data.Id).then(() => {
                          query.invalidateQueries({
                            queryKey: ['item', data.Id],
                          })
                          query.invalidateQueries({
                            queryKey: ['items', data.ParentId],
                          })
                        })
                      } else {
                        users.playedItems(client, data.Id).then(() => {
                          query.invalidateQueries({
                            queryKey: ['item', data.Id],
                          })
                          query.invalidateQueries({
                            queryKey: ['items', data.ParentId],
                          })
                        })
                      }
                    }}
                  />
                  {streams?.videos.length > 1 && (
                    <Button
                      icon="movie"
                      onPress={() => {
                        showMenu('Video')
                      }}
                    />
                  )}
                  {streams?.audios.length > 1 && (
                    <Button
                      icon="volume-high"
                      onPress={() => {
                        showMenu('Audio')
                      }}
                    />
                  )}
                  {streams?.subtitles.length > 0 && (
                    <Button
                      icon="subtitles"
                      onPress={() => {
                        showMenu('Subtitle')
                      }}
                    />
                  )}
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    columnGap: 8,
                    marginTop: 16,
                  }}
                >
                  {data?.ChildCount > 1 ? (
                    <Button
                      icon="television"
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
                        icon="television"
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
                  <Button icon="information" />
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
            backgroundColor: '#00000080',
          }}
        >
          <View
            style={{
              backgroundColor: theme.background,
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
                        title="No Subtitles"
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
          </View>
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
    paddingBottom: 24,
    paddingTop: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
  },
})

export default Details
