import { forwardRef, useState } from 'react'
import {
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import Text from './Text'
import useTheme from 'hooks/useTheme'

interface Props {
  title: string
  subtitle?: string
  icon?: string
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

const ListButton = forwardRef<View, Props>(
  (
    {
      title,
      subtitle,
      icon,
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
    }: Props,
    ref,
  ) => {
    const theme = useTheme()
    const [focus, setFocus] = useState(false)

    const styles = StyleSheet.create({
      root: {
        backgroundColor: theme.background,
        overflow: 'hidden',
        borderRadius: 38,
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 16,
      },
      rootFocus: {
        backgroundColor: theme.foreground,
      },
      title: {
        fontSize: 16,
        fontFamily: theme.font700,
        color: theme.foreground,
      },
      titleFocus: {
        color: theme.background,
      },
      subtitle: {
        fontSize: 14,
        color: theme.foreground,
      },
    })

    return (
      <Pressable
        ref={ref}
        onFocus={() => {
          setFocus(true)
          !!onFocus && onFocus()
        }}
        onBlur={() => {
          setFocus(false)
          !!onBlur && onBlur()
        }}
        onPress={onPress}
        onLongPress={onLongPress}
        style={[styles.root, focus && styles.rootFocus]}
        hasTVPreferredFocus={hasTVPreferredFocus}
        nextFocusUp={nextFocusUp}
        nextFocusDown={nextFocusDown}
        nextFocusLeft={nextFocusLeft}
        nextFocusRight={nextFocusRight}
      >
        <View></View>
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <Text
            style={[styles.title, focus && styles.titleFocus]}
            numberOfLines={2}
          >
            {title}
          </Text>
          {!!subtitle && (
            <Text style={[styles.subtitle, focus && styles.titleFocus]}>
              {subtitle}
            </Text>
          )}
        </View>
      </Pressable>
    )
  },
)

export default ListButton
