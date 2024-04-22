import { useState } from 'react'
import {
  GestureResponderEvent,
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import Text from './Text'
import { Blurhash } from 'react-native-blurhash'
import averageBlurhash from 'lib/averageBlurhash'
import useTheme from 'hooks/useTheme'
import tinycolor from 'tinycolor2'
import { Shadow } from 'react-native-shadow-2'

interface Props {
  title: string
  description?: string
  image: string
  imageFallback?: string
  blurhash?: string
  progressPercentage?: number
  length?: string
  onPress?: (e: GestureResponderEvent) => void
  onFocus?: () => void
  onBlur?: () => void
  style?: StyleProp<ViewStyle>
  hasTVPreferredFocus?: boolean
}

const ItemLong = ({
  title,
  description,
  image,
  imageFallback,
  blurhash,
  progressPercentage,
  length,
  onPress,
  onFocus,
  onBlur,
  style,
  hasTVPreferredFocus,
}: Props) => {
  const theme = useTheme()
  const [focus, setFocus] = useState(hasTVPreferredFocus ? true : false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageURI, setImageURI] = useState(image)
  const color = !!blurhash ? averageBlurhash(blurhash) : theme.tint

  const styles = StyleSheet.create({
    view: {
      flex: 1,
      flexDirection: 'row',
      paddingHorizontal: 32,
      paddingVertical: 8,
    },
    image: {
      width: 240,
      height: 240 * (1 / 2),
      borderRadius: 16,
      overflow: 'hidden',
    },
    details: {
      flex: 1,
      paddingLeft: 32,
      paddingVertical: 16,
    },
  })

  return (
    <Pressable
      hasTVPreferredFocus={hasTVPreferredFocus}
      onPress={onPress}
      onFocus={() => {
        setFocus(true)
        !!onFocus && onFocus()
      }}
      onBlur={() => {
        setFocus(false)
        !!onBlur && onBlur()
      }}
      style={style}
    >
      <View style={[styles.view, focus && { backgroundColor: color + '60' }]}>
        <Shadow
          distance={40}
          startColor={tinycolor(color + '80')
            .lighten((1.0 - tinycolor(color).getLuminance()) * 30)
            .toHex8String()}
          disabled={!focus}
          style={[styles.image, { position: 'absolute' }]}
        />
        <View style={[styles.image, { backgroundColor: 'transparent' }]}>
          {!!blurhash && (
            <Blurhash
              blurhash={blurhash}
              style={[styles.image, { position: 'absolute' }]}
            />
          )}
          <Image
            source={{ uri: imageURI }}
            style={[styles.image, { position: 'absolute' }]}
            onLoad={() => {
              setImageLoaded(true)
            }}
            onError={() => {
              if (!!imageFallback && imageURI !== imageFallback)
                setImageURI(imageFallback)
            }}
          />
        </View>
        <View style={styles.details}>
          <Text style={{ fontSize: 18 }} fontWeight={700}>
            {title}
          </Text>
          {!!description && (
            <Text style={{ fontSize: 16 }} numberOfLines={3}>
              {description}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  )
}

export default ItemLong
