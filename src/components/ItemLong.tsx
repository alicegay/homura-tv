import { useEffect, useRef, useState } from 'react'
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
import Animated, {
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

interface Props {
  id: string
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
  id,
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
  const lastID = useRef(id)
  const theme = useTheme()
  const [focus, setFocus] = useState(hasTVPreferredFocus ? true : false)
  const color = !!blurhash ? averageBlurhash(blurhash) : theme.tint
  const [imageURI, setImageURI] = useState(image)

  if (id !== lastID.current) {
    lastID.current = id
    setImageURI(image)
  }

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
    glow: {
      position: 'absolute',
      top: 8,
      left: 32,
    },
    selector: {
      position: 'absolute',
      top: 8 - 4,
      left: 32 - 4,
      width: 240 + 8,
      height: 240 * (1 / 2) + 8,
      backgroundColor: tinycolor(color)
        .lighten((1.0 - tinycolor(color).getLuminance()) * 40)
        .toHex8String(),
      borderRadius: 16 + 4,
      overflow: 'hidden',
      opacity: 0,
    },
    fallback: {
      position: 'absolute',
      top: 8,
      left: 32,
      width: 240,
      height: 240 * (1 / 2),
      backgroundColor: '#000',
      borderRadius: 16,
      overflow: 'hidden',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  })

  const radius = useSharedValue(0.0)
  const opacity = useSharedValue(0.0)

  useEffect(() => {
    if (focus) {
      radius.value = withTiming(1.0, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      })
      opacity.value = withRepeat(withTiming(1.0, { duration: 400 }), 0, true)
    } else {
      radius.value = withTiming(0.0, {
        duration: 100,
        easing: Easing.in(Easing.quad),
      })
      opacity.value = withTiming(0.0, {
        duration: 400,
        easing: Easing.in(Easing.quad),
      })
    }
  }, [focus])

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
      {/* <View style={[styles.view, focus && { backgroundColor: color + '60' }]}> */}
      <View style={[styles.view]}>
        <Animated.View style={[styles.glow, { opacity: radius }]}>
          <Shadow
            distance={40}
            startColor={tinycolor(color + '80')
              .lighten((1.0 - tinycolor(color).getLuminance()) * 40)
              .toHex8String()}
            style={[styles.image]}
          />
        </Animated.View>
        <Animated.View style={[styles.selector, { opacity: opacity }]} />
        <View style={styles.fallback}>
          <Icon name="movie" size={48} />
        </View>
        <View style={[styles.image, { backgroundColor: 'transparent' }]}>
          {!!blurhash && (
            <Blurhash
              blurhash={blurhash}
              style={[styles.image, { position: 'absolute' }]}
            />
          )}
          {!!imageURI && (
            <Image
              source={{ uri: imageURI }}
              style={[styles.image, { position: 'absolute' }]}
              onError={() => {
                if (!!imageFallback && imageURI !== imageFallback)
                  setImageURI(imageFallback)
              }}
            />
          )}
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
