import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as Sentry from '@sentry/react-native'
import RootStackParamList from 'types/RootStackParamList'
import useTheme from 'hooks/useTheme'
import Home from 'screens/Home'
import Folder from 'screens/Folder'
import Season from 'screens/Season'
import Episodes from 'screens/Episodes'
import Details from 'screens/Details'
import Player from 'screens/Player'
import SelectServer from 'screens/SelectServer'
import SelectUser from 'screens/SelectUser'
import Settings from 'screens/Settings'

const Stack = createNativeStackNavigator<RootStackParamList>()
const queryClient = new QueryClient()

const App = () => {
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
    fonts: DefaultTheme.fonts,
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          initialRouteName="SelectServer"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Folder" component={Folder} />
          <Stack.Screen name="Season" component={Season} />
          <Stack.Screen name="Episodes" component={Episodes} />
          <Stack.Screen name="Details" component={Details} />
          <Stack.Screen name="Player" component={Player} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="SelectServer" component={SelectServer} />
          <Stack.Screen name="SelectUser" component={SelectUser} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  )
}

Sentry.init({
  dsn: 'https://1d2ca083b41f71c960855cbe2cf72ea1@o4507548984016896.ingest.us.sentry.io/4507548989456384',
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
  _experiments: {
    // profilesSampleRate is relative to tracesSampleRate.
    // Here, we'll capture profiles for 100% of transactions.
    profilesSampleRate: 1.0,
  },
})

export default Sentry.wrap(App)
