import { useEffect } from 'react'
import { View } from 'react-native'
import { system, users } from 'jellyfin-api'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ParamListBase } from '@react-navigation/native'
import useClient from 'hooks/useClient'
import Button from 'components/Button'

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
        CLIENT CHECK
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
        onPress={() => {
          navigation.push('Home')
        }}
      >
        SCREEN: Home
      </Button>
      <Button
        onPress={() => {
          navigation.push('VideoDetails')
        }}
      >
        SCREEN: VideoDetails
      </Button>
    </View>
  )
}

export default Initial
