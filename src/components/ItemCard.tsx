import { useEffect, useState } from 'react'
import {
  DimensionValue,
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
import tinycolor from 'tinycolor2'
import useTheme from 'hooks/useTheme'
import {
  Canvas,
  RoundedRect,
  BoxShadow,
  Box,
  rect,
  rrect,
} from '@shopify/react-native-skia'
import {
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { opacity } from 'react-native-reanimated/lib/typescript/reanimated2/Colors'

interface Props {
  title: string
  numberOfLines?: number
  subtitle?: string
  image: string
  imageFallback?: string
  blurhash?: string
  strongShadow?: boolean
  width?: number
  aspectRatio?: 'wide' | 'tall' | 'square'
  progressPercentage?: number
  length?: string
  onPress?: (e: GestureResponderEvent) => void
  onFocus?: () => void
  onBlur?: () => void
  style?: StyleProp<ViewStyle>
  hasTVPreferredFocus?: boolean
}

const ItemCard = ({
  title,
  subtitle,
  numberOfLines = 1,
  image,
  imageFallback,
  blurhash,
  strongShadow,
  width = 256,
  aspectRatio = 'wide',
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
  const color = !!blurhash ? averageBlurhash(blurhash) : theme.tint
  const shadowColor = strongShadow ? color + '80' : color + '40'
  const [imageURI, setImageURI] = useState(image)

  const aspectRatioMultiplier =
    aspectRatio === 'wide' ? 9 / 16 : aspectRatio === 'tall' ? 3 / 2 : 1
  const topPadding = numberOfLines > 1 ? 8 : 16

  const styles = StyleSheet.create({
    view: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: topPadding,
    },
    padding: {
      width: width,
      height: width * aspectRatioMultiplier,
    },
    canvas: {
      position: 'absolute',
      left: -16,
      top: -48,
      width: width + 32 + 32,
      height: width * aspectRatioMultiplier + topPadding * 2 + 64 + 16,
    },
    image: {
      width: width,
      height: width * aspectRatioMultiplier,
      borderRadius: 16,
      marginBottom: 2,
      overflow: 'hidden',
    },
    length: {
      flex: 0,
      position: 'absolute',
      bottom: 3,
      right: 6,
      paddingHorizontal: 6,
      borderRadius: 6,
      backgroundColor: theme.background,
    },
    progress: {
      position: 'absolute',
      bottom: 0,
      width: !!progressPercentage
        ? ((progressPercentage.toString() + '%') as DimensionValue)
        : 0,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.tint,
    },
  })

  const radius = useSharedValue(0)
  const opacity = useSharedValue(0.0)

  useEffect(() => {
    if (focus) {
      radius.value = withTiming(20, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      })
      opacity.value = withRepeat(withTiming(1.0, { duration: 400 }), 0, true)
    } else {
      radius.value = withTiming(0, {
        duration: 100,
        easing: Easing.in(Easing.quad),
      })
      opacity.value = withTiming(0.0, {
        duration: 200,
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
      <View style={[styles.view]}>
        <View style={styles.padding} />
        <Canvas style={styles.canvas}>
          <Box
            box={rrect(
              rect(
                16 + 16,
                topPadding + 48,
                width,
                width * aspectRatioMultiplier,
              ),
              20,
              20,
            )}
            color={tinycolor(color)
              .lighten((1.0 - tinycolor(color).getLuminance()) * 40)
              .toHex8String()}
          >
            <BoxShadow
              dx={0}
              dy={0}
              blur={radius}
              color={tinycolor(color)
                .lighten((1.0 - tinycolor(color).getLuminance()) * 20)
                .toHex8String()}
            />
          </Box>
          <RoundedRect
            x={16 - 4 + 16}
            y={topPadding + 48 - 4}
            width={width + 8}
            height={width * aspectRatioMultiplier + 8}
            color={tinycolor(color)
              .lighten((1.0 - tinycolor(color).getLuminance()) * 40)
              .toHex8String()}
            r={16 + 4}
            opacity={opacity}
          />
        </Canvas>
        <View
          style={[
            styles.image,
            {
              position: 'absolute',
              top: numberOfLines > 1 ? 8 : 16,
              left: 16,
              backgroundColor: 'transparent',
            },
          ]}
        >
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
          {!!length && (
            <View style={styles.length}>
              <Text style={[styles.length]}>{length}</Text>
            </View>
          )}
          {!!progressPercentage && <View style={styles.progress} />}
        </View>
        <Text
          style={{ fontSize: 16, width: width }}
          fontWeight={500}
          numberOfLines={numberOfLines}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text style={{ fontSize: 14, width: width }} fontWeight={400}>
            {subtitle}
          </Text>
        )}
      </View>
    </Pressable>
  )
}

export default ItemCard
