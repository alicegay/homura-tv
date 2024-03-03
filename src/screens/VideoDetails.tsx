import { useState } from 'react'
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Button from 'components/Button'

const VideoDetails = () => {
  const [posterImage, setPosterImage] = useState(
    'http://192.168.8.8:8096/Items/4b607808f3e5c9bf26bb82da1208fc8a/Images/Primary',
  )
  const [backdropImage, setBackdropImage] = useState(
    'http://192.168.8.8:8096/Items/4b607808f3e5c9bf26bb82da1208fc8a/Images/Backdrop/0',
  )
  const [logoImage, setLogoImage] = useState(
    'http://192.168.8.8:8096/Items/4b607808f3e5c9bf26bb82da1208fc8a/Images/Logo',
  )

  return (
    <View style={styles.root}>
      <ImageBackground
        source={{
          uri: backdropImage,
        }}
        resizeMode="cover"
        style={styles.backdrop}
      >
        <View style={styles.backdropView}>
          <Image
            source={{ uri: logoImage }}
            width={600}
            height={200}
            resizeMode="contain"
            style={styles.backdropImage}
          />
        </View>
      </ImageBackground>
      <View style={styles.details}>
        <LinearGradient
          colors={['#00000000', '#00000040']}
          style={styles.detailsGradient}
        >
          <Text numberOfLines={1} style={{ fontSize: 32, fontWeight: '600' }}>
            Shin Godzilla
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 20, fontWeight: '600' }}>
            シン・ゴジラ
          </Text>
          <View
            style={{
              flexDirection: 'row',
              columnGap: 16,
              marginTop: 12,
            }}
          >
            <Text style={{ fontSize: 14 }}>2016</Text>
            <Text style={{ fontSize: 14 }}>119 min</Text>
            <Text style={{ fontSize: 14 }}>4K</Text>
            <Text style={{ fontSize: 14 }}>Japanese DTS-HD 3.1</Text>
            <Text style={{ fontSize: 14 }}>English SSA/ASS</Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              columnGap: 8,
              marginTop: 16,
            }}
          >
            {/* <Button icon="reload">Resume</Button> */}
            <Button icon="play">Play</Button>
            {/* <Button icon="movie" /> */}
            <Button icon="information" />
            <Button icon="volume-high" />
            <Button icon="subtitles" />
          </View>
        </LinearGradient>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  backdrop: {
    flex: 1,
  },
  backdropView: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#00000040',
  },
  backdropImage: {
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
    paddingTop: 32,
  },
})

export default VideoDetails
