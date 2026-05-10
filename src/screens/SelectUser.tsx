import { useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import RootStackParamList from 'types/RootStackParamList'
import { AxiosError } from 'axios'
import { users } from 'jellyfin-api'
import useClient from 'hooks/useClient'
import useTheme from 'hooks/useTheme'
import Text from 'components/Text'
import TextInput from 'components/TextInput'
import Button from 'components/Button'
import CenterLoading from 'components/CenterLoading'
import DeviceInfo from 'react-native-device-info'

const SelectUser = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'SelectUser'>) => {
  const { server } = route.params
  const client = useClient()
  const theme = useTheme()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const passwordRef = useRef<any>(null)

  const styles = StyleSheet.create({
    view: {
      flex: 1,
      backgroundColor: theme.background,
      marginHorizontal: 192,
      marginTop: 96,
    },
    input: { marginBottom: 8 },
    options: { flexDirection: 'row-reverse', gap: 16 },
  })

  const submit = async () => {
    setIsLoading(true)
    setError('')
    const clientName = DeviceInfo.getApplicationName()
    const deviceName = await DeviceInfo.getDeviceName()
    const deviceID = client.deviceID
    const clientVer = DeviceInfo.getVersion()
    users
      .authenticateByName(
        server,
        username,
        password,
        clientName,
        deviceName,
        deviceID,
        clientVer,
      )
      .then(async (res) => {
        if (Object(res) !== res) {
          setIsLoading(false)
          setError('Unknown error')
          return
        }
        if ('isAxiosError' in res && res.isAxiosError) {
          submitError(res as unknown as AxiosError)
          return
        }

        client.setClient({
          server: server,
          clientName: clientName,
          deviceName: deviceName,
          deviceID: deviceID,
          version: clientVer,
          user: res.User.Id,
          token: res.AccessToken,
        })
        console.log('SIGNED IN')
      }, submitError)
  }
  const submitError = (error: AxiosError) => {
    setIsLoading(false)
    console.log(error.message)
    console.log(error.code)
    if (error.code === 'ERR_BAD_REQUEST')
      setError('Incorrect username and/or password')
    if (error.code === 'ERR_NETWORK')
      setError('Could not connect to the server')
  }

  useEffect(() => {
    if (client.client) {
      navigation.replace('Home')
    }
  }, [client.client])

  return (
    <View style={styles.view}>
      <Text fontWeight={700} style={{ fontSize: 24, marginBottom: 8 }}>
        {client.name}
      </Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        autoCapitalize="none"
        autoCorrect={false}
        inputMode="text"
        autoFocus={true}
        enterKeyHint="next"
        onSubmitEditing={() => {
          passwordRef.current.focus()
        }}
        style={styles.input}
      />
      <TextInput
        ref={passwordRef}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        autoCapitalize="none"
        autoCorrect={false}
        inputMode="text"
        secureTextEntry={true}
        enterKeyHint="next"
        onSubmitEditing={submit}
        style={styles.input}
      />
      <View style={styles.options}>
        <Button onPress={submit}>Sign in</Button>
        <View style={{ flex: 1 }}>
          <Text style={{ paddingTop: 8 }} numberOfLines={2}>
            {error}
          </Text>
        </View>
      </View>
      {isLoading && <CenterLoading />}
    </View>
  )
}

export default SelectUser
