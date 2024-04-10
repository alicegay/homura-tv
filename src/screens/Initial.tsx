import { Linking, View } from 'react-native'
import { system, users } from 'jellyfin-api'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ParamListBase } from '@react-navigation/native'
import useClient from 'hooks/useClient'
import Button from 'components/Button'
import DeviceInfo from 'react-native-device-info'

const Initial = ({
  navigation,
  route,
}: NativeStackScreenProps<ParamListBase>) => {
  const client = useClient()

  return (
    <View>
      <Button
        onPress={() => {
          system.infoPublic(process.env.SERVER).then((res) => console.log(res))
        }}
      >
        SERVER
      </Button>
      <Button
        onPress={() => {
          console.log('CLIENT:', !!client.client)
          console.log('SERVER:', !!client.server)
          console.log('USER:', !!client.user)
          console.log('TOKEN:', !!client.token)
        }}
      >
        {'CLIENT CHECK: ' + !!client.client}
      </Button>
      <Button
        onPress={() => {
          users
            .authenticateByName(
              process.env.SERVER,
              process.env.USERNAME,
              process.env.PASSWORD,
              'Homura',
              'Android',
              'deviceID',
              '1.0.0',
            )
            .then((res) => {
              client.setClient({
                server: process.env.SERVER,
                clientName: 'Homura',
                deviceName: 'Android',
                deviceID: 'deviceID',
                version: '1.0.0',
                user: res.User.Id,
                token: res.AccessToken,
              })
              console.log('SIGNED IN')
            })
        }}
      >
        Sign in
      </Button>
      <Button
        onPress={() => {
          client.signout()
        }}
      >
        Sign out
      </Button>
      <Button
        hasTVPreferredFocus={true}
        onPress={() => {
          navigation.push('Home')
        }}
      >
        SCREEN: Home
      </Button>
      <Button
        onPress={() => {
          console.log(DeviceInfo.getSupportedMediaTypeListSync())
        }}
      >
        Supported Codecs
      </Button>
      {/* Android TV Emulator:
      [
        "audio/mp4a-latm",
        "audio/3gpp",
        "audio/amr-wb",
        "audio/flac",
        "audio/g711-alaw",
        "audio/mpeg",
        "audio/opus",
        "audio/raw",
        "audio/vorbis",
        "video/avc",
        "video/x-vnd.on2.vp8",
        "video/x-vnd.on2.vp9",
        "video/av01",
        "video/3gpp",
        "video/hevc",
        "video/mpeg2",
        "video/mp4v-es",
      ]
        Chromecast with Google TV:
      [
        "audio/mp4a-latm",
        "audio/3gpp",
        "audio/amr-wb",
        "audio/flac",
        "audio/g711-alaw",
        "audio/mpeg",
        "audio/opus",
        "audio/raw",
        "audio/vorbis",
        "video/x-vnd.on2.vp9",
        "video/avc",
        "video/dolby-vision",
        "video/hevc",
        "video/mpeg2",
        "video/mp4v-es",
        "video/x-vnd.on2.vp8",
        "video/3gpp",
        "video/x-vnd.on2.vp8",
      ]
      */}
      <Button
        onPress={async () => {
          try {
            await Linking.sendIntent('android.settings.CAPTIONING_SETTINGS')
          } catch (e: any) {
            console.log(e)
          }
        }}
      >
        Captions Settings
      </Button>
    </View>
  )
}

export default Initial
