import { DimensionValue, View } from 'react-native'
import useTheme from 'hooks/useTheme'
import tinycolor from 'tinycolor2'

interface Props {
  currentTime: number
  duration: number
  bufferTime: number
  seeking: boolean
  selected: boolean
}

const Seekbar = ({
  currentTime,
  duration,
  bufferTime,
  seeking,
  selected,
}: Props) => {
  const theme = useTheme()

  return (
    <View style={{ flexGrow: 1 }}>
      <View
        style={[
          {
            position: 'absolute',
            width: '100%',
            height: 4,
            backgroundColor: theme.foreground,
            borderRadius: 2,
            top: 10,
          },
          selected && {
            height: 6,
            top: 9,
            borderRadius: 3,
          },
        ]}
      />
      <View
        style={[
          {
            position: 'absolute',
            width: ((bufferTime / duration) * 100 + '%') as DimensionValue,
            height: 4,
            backgroundColor: tinycolor(theme.foreground)
              .darken(30)
              .toHex8String(),
            borderRadius: 2,
            top: 10,
          },
          selected && {
            height: 6,
            top: 9,
            borderRadius: 3,
          },
        ]}
      />
      <View
        style={[
          {
            position: 'absolute',
            width: ((currentTime / duration) * 100 + '%') as DimensionValue,
            height: 4,
            backgroundColor: theme.tint,
            borderRadius: 2,
            top: 10,
          },
          selected && {
            height: 8,
            top: 8,
            borderRadius: 4,
          },
        ]}
      />
      <View
        style={[
          {
            position: 'absolute',
            backgroundColor: theme.foreground,
            width: 12,
            height: 12,
            top: 6,
            borderRadius: 6,
            transform: [{ translateX: -5 }],
            left: ((currentTime / duration) * 100 + '%') as DimensionValue,
          },
          !seeking && { display: 'none' },
        ]}
      />
    </View>
  )
}

export default Seekbar
