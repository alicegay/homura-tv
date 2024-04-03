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

const VideoDetails = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'VideoDetails'>) => {
  const { item } = route.params

  const client = useClient()
  const theme = useTheme()
  const { data, isLoading } = useItem(item.Id)

  const [primaryImage, setPrimaryImage] = useState(
    client.server + '/Items/' + item.Id + '/Images/Primary',
  )
  const [backdropImage, setBackdropImage] = useState(
    client.server + '/Items/' + item.Id + '/Images/Backdrop/0',
  )
  const [logoImage, setLogoImage] = useState(
    client.server + '/Items/' + item.Id + '/Images/Logo',
  )

  // useEffect(() => {
  //   console.log(item.ImageTags)
  // }, [])

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ImageBackground
        source={{
          uri: item.ImageBlurHashes.hasOwnProperty('Backdrop')
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
          <Text style={styles.title} fontWeight={700}>
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
            <Text>{ticksToTime(item.RunTimeTicks, true)}</Text>
            {!!item.OfficialRating && (
              <Classification rating={item.OfficialRating} />
            )}
            {/* <Text>4K HDR</Text>
            <Text>Japanese DTS-HD MA 3.1</Text>
            <Text>English SSA/ASS</Text> */}
          </View>

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
              icon={item.UserData.PlaybackPositionTicks > 0 ? 'reload' : 'play'}
              hasTVPreferredFocus={
                item.UserData.PlaybackPositionTicks > 0 ? false : true
              }
            >
              Play
            </Button>
            {/* <Button icon="movie" /> */}
            <Button icon="information" />
            <Button icon="check" />
            <Button icon="volume-high" />
            <Button icon="subtitles" />
          </View>
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
