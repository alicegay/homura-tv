import { useState } from 'react'
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
import { Shadow } from 'react-native-shadow-2'
import tinycolor from 'tinycolor2'
import useTheme from 'hooks/useTheme'

interface Props {
  title: string
  numberOfLines?: number
  subtitle?: string
  image: string
  blurhash?: string
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
  blurhash,
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

  const aspectRatioMultiplier =
    aspectRatio === 'wide' ? 9 / 16 : aspectRatio === 'tall' ? 3 / 2 : 1
  const styles = StyleSheet.create({
    view: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: numberOfLines > 1 ? 8 : 16,
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
        <Shadow
          distance={40}
          startColor={tinycolor(color + '40')
            .lighten((1.0 - tinycolor(color).getLuminance()) * 30)
            .toHex8String()}
          disabled={!focus}
          style={styles.image}
        />
        <View
          style={[
            styles.image,
            {
              position: 'absolute',
              top: numberOfLines > 1 ? 8 : 16,
              left: 16,
            },
          ]}
        >
          {!!blurhash && !imageLoaded && (
            <Blurhash blurhash={blurhash} style={styles.image} />
          )}
          <Image
            source={{ uri: image }}
            style={[styles.image, !imageLoaded && { width: 0, height: 0 }]}
            onLoad={() => {
              setImageLoaded(true)
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
