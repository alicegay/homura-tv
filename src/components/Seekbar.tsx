import { DimensionValue, View } from 'react-native'
import useTheme from 'hooks/useTheme'
import tinycolor from 'tinycolor2'

interface Props {
  currentTime: number
  duration: number
  bufferTime: number
  seeking: boolean
  seekTime: number
}

const Seekbar = ({
  currentTime,
  duration,
  bufferTime,
  seeking,
  seekTime,
}: Props) => {
  const theme = useTheme()

  return (
    <View style={{ flexGrow: 1 }}>
      <View
        style={{
          position: 'absolute',
          width: '100%',
          height: 4,
          backgroundColor: theme.foreground,
          borderRadius: 2,
          top: 10,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: ((bufferTime / duration) * 100 + '%') as DimensionValue,
          height: 4,
          backgroundColor: tinycolor(theme.foreground)
            .darken(30)
            .toHex8String(),
          borderRadius: 2,
          top: 10,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: seeking
            ? (((seekTime / duration) * 100 + '%') as DimensionValue)
            : (((currentTime / duration) * 100 + '%') as DimensionValue),
          height: seeking ? 6 : 4,
          backgroundColor: theme.tint,
          borderRadius: seeking ? 3 : 2,
          top: seeking ? 9 : 10,
        }}
      />
    </View>
  )
}

export default Seekbar
