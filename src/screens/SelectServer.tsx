import { useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import BootSplash from 'react-native-bootsplash'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import RootStackParamList from 'types/RootStackParamList'
import { system } from 'jellyfin-api'
import { AxiosError } from 'axios'
import DeviceInfo from 'react-native-device-info'
import useClient from 'hooks/useClient'
import useTheme from 'hooks/useTheme'
import Text from 'components/Text'
import TextInput from 'components/TextInput'
import Button from 'components/Button'
import CenterLoading from 'components/CenterLoading'

const SelectServer = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'SelectServer'>) => {
  const client = useClient()
  const theme = useTheme()

  const [server, setServer] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const serverRef = useRef<any>(null)

  const submit = () => {
    setIsLoading(true)
    setError('')
    const s = stripTrailingSlash(server)
    system.infoPublic(s).then((res) => {
      setIsLoading(false)
      if (Object(res) !== res) {
        setError('Could not connect to the server')
        return
      }
      if ('isAxiosError' in res && res.isAxiosError) {
        submitError(res as unknown as AxiosError)
        return
      }
      if (!res.StartupWizardCompleted) {
        setError('Server is not setup')
        return
      }
      if ('StartupWizardCompleted' in res && res.StartupWizardCompleted) {
        client.setName(res.ServerName)
        navigation.replace('SelectUser', { server: s })
      } else {
        setError('Could not connect to the server')
      }
    }, submitError)
  }

  const submitError = (error: AxiosError) => {
    setIsLoading(false)
    console.log(error.message)
    if (error.code === 'ERR_NETWORK')
      setError('Could not connect to the server')
  }

  useEffect(() => {
    console.log('client.hasHydrated', client.hasHydrated)
    if (client.hasHydrated) {
      if (client.client) {
        navigation.replace('Home')
      } else if (
        !client.client &&
        client.server &&
        client.user &&
        client.token
      ) {
        resetClient()
      } else {
        BootSplash.hide({ fade: true })
        serverRef.current.focus()
      }
    }
  }, [client.hasHydrated])

  const resetClient = async () => {
    const clientName = DeviceInfo.getApplicationName()
    const deviceName = await DeviceInfo.getDeviceName()
    const deviceID = client.deviceID
    const clientVer = DeviceInfo.getVersion()
    client.setClient({
      server: client.server,
      clientName: clientName,
      deviceName: deviceName,
      deviceID: deviceID,
      version: clientVer,
      user: client.user,
      token: client.token,
    })
    console.log('CLIENT RESET')
    navigation.replace('Home')
  }

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

  return (
    <View style={styles.view}>
      <Text fontWeight={700} style={{ fontSize: 24, marginBottom: 8 }}>
        Select Server
      </Text>
      <TextInput
        ref={serverRef}
        value={server}
        onChangeText={setServer}
        placeholder="https://"
        autoCapitalize="none"
        autoCorrect={false}
        inputMode="url"
        // autoFocus={true}
        enterKeyHint="next"
        onSubmitEditing={submit}
        style={styles.input}
      />
      <View style={styles.options}>
        <Button onPress={submit}>Next</Button>
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

const stripTrailingSlash = (str: string) => {
  return str.endsWith('/') ? str.slice(0, -1) : str
}

export default SelectServer
