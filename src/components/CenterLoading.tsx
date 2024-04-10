import { ActivityIndicator, View } from 'react-native'
import useTheme from 'hooks/useTheme'

const CenterLoading = () => {
  const theme = useTheme()

  return (
    <View
      style={{
        position: 'absolute',
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <ActivityIndicator color={theme.foreground} size={64} />
    </View>
  )
}

export default CenterLoading
