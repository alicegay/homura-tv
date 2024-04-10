import { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useClient from 'hooks/useClient'
import useTheme from 'hooks/useTheme'

import RootStackParamList from 'types/RootStackParamList'
import Initial from 'screens/Initial'
import Home from 'screens/Home'
import Folder from 'screens/Folder'
import Season from 'screens/Season'
import Episodes from 'screens/Episodes'
import VideoDetails from 'screens/VideoDetails'
import Player from 'screens/Player'

const Stack = createNativeStackNavigator<RootStackParamList>()
const queryClient = new QueryClient()

const App = () => {
  const client = useClient()

  useEffect(() => {
    if (!client.client && client.server && client.user && client.token) {
      client.setClient({
        server: client.server,
        clientName: 'Homura',
        deviceName: 'Android',
        deviceID: 'deviceID',
        version: '1.0.0',
        user: client.user,
        token: client.token,
      })
      console.log('CLIENT RESET')
    }
  }, [client.token])

  const theme = useTheme()
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
    <QueryClientProvider client={queryClient}>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          initialRouteName="Initial"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Initial" component={Initial} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Folder" component={Folder} />
          <Stack.Screen name="Season" component={Season} />
          <Stack.Screen name="Episodes" component={Episodes} />
          <Stack.Screen name="VideoDetails" component={VideoDetails} />
          <Stack.Screen name="Player" component={Player} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  )
}

export default App
