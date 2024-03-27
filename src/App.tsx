import { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import DeviceInfo from 'react-native-device-info'
import VideoDetails from 'screens/VideoDetails'
import useThemeStore from 'hooks/useThemeStore'
import Initial from 'screens/Initial'

const Stack = createNativeStackNavigator()

const App = () => {
  useEffect(() => {
    console.log(DeviceInfo.getSupportedMediaTypeListSync())

    // ["audio/mp4a-latm", "audio/mp4a-latm", "audio/mp4a-latm", "audio/mp4a-latm", "audio/3gpp", "audio/3gpp", "audio/3gpp", "audio/3gpp", "audio/amr-wb", "audio/amr-wb", "audio/amr-wb", "audio/amr-wb", "audio/flac", "audio/flac", "audio/flac", "audio/flac", "audio/g711-alaw", "audio/g711-alaw", "audio/g711-mlaw", "audio/g711-mlaw", "audio/mpeg", "audio/mpeg", "audio/opus", "audio/opus", "audio/opus", "audio/raw", "audio/raw", "audio/vorbis", "audio/vorbis", "video/avc", "video/x-vnd.on2.vp8", "video/x-vnd.on2.vp9", "video/av01", "video/av01", "video/avc", "video/avc", "video/avc", "video/avc", "video/3gpp", "video/3gpp", "video/3gpp", "video/3gpp", "video/hevc", "video/hevc", "video/hevc", "video/mpeg2", "video/mpeg2", "video/mp4v-es", "video/mp4v-es", "video/mp4v-es", "video/mp4v-es", "video/x-vnd.on2.vp8", "video/x-vnd.on2.vp8", "video/x-vnd.on2.vp8", "video/x-vnd.on2.vp8", "video/x-vnd.on2.vp9", "video/x-vnd.on2.vp9", "video/x-vnd.on2.vp9", "video/x-vnd.on2.vp9"]
  }, [])

  const theme = useThemeStore()
  const navTheme = {
    dark: true,
    colors: {
      primary: theme.tint,
      background: theme.background,
      card: theme.background,
      text: theme.foreground,
      border: theme.background,
      notification: theme.background,
    },
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Initial"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Initial" component={Initial} />
        <Stack.Screen name="VideoDetails" component={VideoDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App
