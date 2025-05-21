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
  const theme = useTheme()
  const [focus, setFocus] = useState(hasTVPreferredFocus ? true : false)
  const colorAverage = !!blurhash ? averageBlurhash(blurhash) : theme.tint
  const color = cardColor(colorAverage)
  const [imageURI, setImageURI] = useState(image)

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
      borderRadius: 8,
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
      width: 240 + 8 + 656,
      height: 240 * (1 / 2) + 8,
      backgroundColor: color,
      borderRadius: 8 + 4,
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
        {focus && (
          <Animated.View
            style={styles.selector}
            entering={FadeIn.duration(100)}
            exiting={FadeOut.duration(100)}
          />
        )}
        <View style={[styles.image, { backgroundColor: '#000' }]}>
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
