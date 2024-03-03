import { ReactNode, forwardRef, useState } from 'react'
import {
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native'

interface Props {
  children: ReactNode
  type?: 'primary'
  icon?: string
  onPress?: (e: GestureResponderEvent) => void
  onLongPress?: (e: GestureResponderEvent) => void
  style?: StyleProp<ViewStyle>
  hasTVPreferredFocus?: boolean
  nextFocusUp?: number
  nextFocusDown?: number
  nextFocusLeft?: number
  nextFocusRight?: number
}

const Button = forwardRef<View, Props>(
  (
    {
      children,
      type = 'primary',
      icon,
      onPress,
      onLongPress,
      style,
      hasTVPreferredFocus,
      nextFocusUp,
      nextFocusDown,
      nextFocusLeft,
      nextFocusRight,
    }: Props,
    ref,
  ) => {
    const [focus, setFocus] = useState(false)

    return (
      <Pressable
        ref={ref}
        onFocus={() => {
          setFocus(true)
        }}
        onBlur={() => {
          setFocus(false)
        }}
        onPress={onPress}
        onLongPress={onLongPress}
        style={[styles.root, focus && styles.rootFocus, style]}
        hasTVPreferredFocus={hasTVPreferredFocus}
        nextFocusUp={nextFocusUp}
        nextFocusDown={nextFocusDown}
        nextFocusLeft={nextFocusLeft}
        nextFocusRight={nextFocusRight}
      >
        <Text
          numberOfLines={1}
          style={[styles.label, focus && styles.labelFocus]}
        >
          {children}
        </Text>
      </Pressable>
    )
  },
)

const styles = StyleSheet.create({
  root: {
    minWidth: 96,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#000080',
  },
  rootFocus: {
    backgroundColor: '#eee',
  },
  icon: {
    marginLeft: 16,
    marginRight: -16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 8,
    marginHorizontal: 24,
    color: '#eee',
  },
  labelFocus: {
    color: '#222',
  },
})

export default Button
