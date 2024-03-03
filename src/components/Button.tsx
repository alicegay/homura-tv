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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

interface Props {
  children?: ReactNode
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
        style={[
          styles.root,
          focus && styles.rootFocus,
          children && styles.rootWithLabel,
          style,
        ]}
        hasTVPreferredFocus={hasTVPreferredFocus}
        nextFocusUp={nextFocusUp}
        nextFocusDown={nextFocusDown}
        nextFocusLeft={nextFocusLeft}
        nextFocusRight={nextFocusRight}
      >
        {icon && (
          <Icon
            name={icon}
            style={[
              styles.icon,
              focus && styles.iconFocus,
              children && styles.iconWithLabel,
            ]}
          />
        )}
        {children && (
          <Text
            numberOfLines={1}
            style={[styles.label, focus && styles.labelFocus]}
          >
            {children}
          </Text>
        )}
      </Pressable>
    )
  },
)

const styles = StyleSheet.create({
  root: {
    minWidth: 36,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#222',
  },
  rootFocus: {
    backgroundColor: '#eee',
  },
  rootWithLabel: {
    minWidth: 96,
  },
  icon: {
    fontSize: 14,
    color: '#eee',
  },
  iconFocus: {
    color: '#222',
  },
  iconWithLabel: {
    marginLeft: 16,
    marginRight: -16,
  },
  label: {
    fontSize: 14,
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
