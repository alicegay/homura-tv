import { useState } from 'react'
import {
  DimensionValue,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import Text from './Text'
import averageBlurhash from 'lib/averageBlurhash'
import useTheme from 'hooks/useTheme'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { FasterImageView } from '@candlefinance/faster-image'
import cardColor from 'lib/cardColor'

interface Props {
  id: string
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
  onLongPress?: (e: GestureResponderEvent) => void
  onFocus?: () => void
  onBlur?: () => void
  style?: StyleProp<ViewStyle>
  hasTVPreferredFocus?: boolean
  nextFocusUp?: number
  nextFocusDown?: number
  nextFocusLeft?: number
  nextFocusRight?: number
}

const ItemCard = ({
  id,
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
  onLongPress,
  onFocus,
  onBlur,
  style,
  hasTVPreferredFocus,
  nextFocusUp,
  nextFocusDown,
  nextFocusLeft,
  nextFocusRight,
}: Props) => {
  const theme = useTheme()
  const [focus, setFocus] = useState(hasTVPreferredFocus ? true : false)
  const colorAverage = !!blurhash ? averageBlurhash(blurhash) : theme.tint
  const color = cardColor(colorAverage)
  const [imageURI, setImageURI] = useState(image)
  const [titleLines, setTitleLines] = useState(1)

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
    glow: {
      position: 'absolute',
      left: 16,
      top: topPadding,
      opacity: 0,
    },
    selector: {
      position: 'absolute',
      left: 16 - 4,
      top: topPadding - 4,
      width: width + 8,
      height:
        width * aspectRatioMultiplier +
        8 +
        22 * titleLines +
        (subtitle ? 22 : 0),
      backgroundColor: color,
      borderRadius: 8 + 4,
      overflow: 'hidden',
    },
    fallback: {
      position: 'absolute',
      left: 16,
      top: topPadding,
      width: width,
      height: width * aspectRatioMultiplier,
      backgroundColor: '#000',
      borderRadius: 16,
      overflow: 'hidden',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: width,
      height: width * aspectRatioMultiplier,
      borderRadius: 8,
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
      onLongPress={onLongPress}
      onFocus={() => {
        setFocus(true)
        !!onFocus && onFocus()
      }}
      onBlur={() => {
        setFocus(false)
        !!onBlur && onBlur()
      }}
      style={style}
      nextFocusUp={nextFocusUp}
      nextFocusDown={nextFocusDown}
      nextFocusLeft={nextFocusLeft}
      nextFocusRight={nextFocusRight}
    >
      <View style={[styles.view]}>
        <View style={styles.padding} />
        {focus && (
          <Animated.View
            style={styles.selector}
            entering={FadeIn.duration(100)}
            exiting={FadeOut.duration(100)}
          />
        )}
        <View
          style={[
            styles.image,
            {
              position: 'absolute',
              top: numberOfLines > 1 ? 8 : 16,
              left: 16,
              backgroundColor: '#000',
            },
          ]}
        >
          {/* {!!blurhash && (
            <Blurhash
              blurhash={blurhash}
              style={[styles.image, { position: 'absolute' }]}
            />
          )} */}
          {!!imageURI && (
            <FasterImageView
              source={{
                url: !!imageFallback ? imageURI : image,
                resizeMode: 'cover',
              }}
              style={[styles.image, { position: 'absolute' }]}
              onError={() => {
                if (!!imageFallback && imageURI !== imageFallback)
                  setImageURI(imageFallback)
              }}
            />
          )}
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
          onTextLayout={({ nativeEvent }) => {
            setTitleLines(Math.min(nativeEvent.lines.length, numberOfLines))
          }}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text
            style={{ fontSize: 14, width: width }}
            fontWeight={400}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </Pressable>
  )
}

export default ItemCard
