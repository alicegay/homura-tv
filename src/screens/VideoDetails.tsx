import { useEffect, useState } from 'react'
import { Image, ImageBackground, StyleSheet, View } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import RootStackParamList from 'types/RootStackParamList'
import useClient from 'hooks/useClient'
import useItem from 'api/useItem'
import useTheme from 'hooks/useTheme'
import LinearGradient from 'react-native-linear-gradient'
import Button from 'components/Button'
import Text from 'components/Text'
import Classification from 'components/Classification'
import ticksToTime from 'lib/ticksToTime'
import sortStreams, { sortedStreams } from 'lib/sortStreams'
import useSeasons from 'api/useSeasons'

const VideoDetails = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'VideoDetails'>) => {
  const { item } = route.params

  const video =
    item.Type === 'Movie' ||
    item.Type === 'Episode' ||
    item.Type === 'MusicVideo'

  const client = useClient()
  const theme = useTheme()
  const { data, isLoading } = useItem(item.Id)
  const [streams, setStreams] = useState<sortedStreams>(null)

  const backdropExists = 'Backdrop' in item.ImageBlurHashes
  const logoExists = 'Logo' in item.ImageBlurHashes

  const [primaryImage, setPrimaryImage] = useState(
    client.server + '/Items/' + item.Id + '/Images/Primary',
  )
  const [backdropImage, setBackdropImage] = useState(
    client.server +
      '/Items/' +
      item.Id +
      '/Images/Backdrop/0?' +
      (backdropExists ? item.ImageBlurHashes.Backdrop[0] : ''),
  )
  const [logoImage, setLogoImage] = useState(
    client.server +
      '/Items/' +
      item.Id +
      '/Images/Logo?' +
      (logoExists ? item.ImageBlurHashes.Logo[0] : ''),
  )

  useEffect(() => {
    if (video && data) setStreams(sortStreams(data.MediaStreams))
  }, [data])

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ImageBackground
        source={{
          uri:
            item.ImageBlurHashes.hasOwnProperty('Backdrop') &&
            item.Type !== 'Episode'
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
      <View style={styles.details}>
        <LinearGradient
          colors={[
            '#00000000',
            item.ImageTags.hasOwnProperty('Logo') ? '#00000040' : '#00000080',
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
            {!!streams && (
              <>
                <Text>{streams.videos[streams.defaults.video].title}</Text>
                <Text>{streams.audios[streams.defaults.audio].title}</Text>
                {streams.defaults.subtitle != -1 && (
                  <Text>
                    {streams.subtitles[streams.defaults.subtitle].title}
                  </Text>
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
              {item.UserData.PlaybackPositionTicks > 0 && (
                <Button icon="play" hasTVPreferredFocus={true}>
                  Resume from {ticksToTime(item.UserData.PlaybackPositionTicks)}
                </Button>
              )}
              <Button
                icon={
                  item.UserData.PlaybackPositionTicks > 0 ? 'reload' : 'play'
                }
                hasTVPreferredFocus={
                  item.UserData.PlaybackPositionTicks > 0 ? false : true
                }
              >
                Play
              </Button>
              {/* <Button icon="movie" /> */}
              <Button icon="information" />
              <Button icon={data?.UserData.Played ? 'check-all' : 'check'} />
              {streams?.videos.length > 1 && <Button icon="movie" />}
              {streams?.audios.length > 1 && <Button icon="volume-high" />}
              {streams?.subtitles.length > 0 && <Button icon="subtitles" />}
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
    </View>
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

export default VideoDetails
