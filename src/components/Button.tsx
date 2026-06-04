import { ReactNode, Ref, useState } from 'react'
import {
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import useTheme from 'hooks/useTheme'
import Text from './Text'
import { Icon, IconFilled } from './Icon'

interface Props {
  children?: ReactNode
  small?: boolean
  transparent?: boolean
  icon?: string
  filled?: boolean
  onPress?: (e: GestureResponderEvent) => void
  onLongPress?: (e: GestureResponderEvent) => void
  style?: StyleProp<ViewStyle>
  hasTVPreferredFocus?: boolean
  nextFocusUp?: number
  nextFocusDown?: number
  nextFocusLeft?: number
  nextFocusRight?: number
  ref?: Ref<View>
}

const Button = ({
  children,
  small = false,
  transparent = false,
  icon,
  filled = false,
  onPress,
  onLongPress,
  style,
  hasTVPreferredFocus,
  nextFocusUp,
  nextFocusDown,
  nextFocusLeft,
  nextFocusRight,
  ref,
}: Props) => {
  const theme = useTheme()
  const [focus, setFocus] = useState(false)

  const styles = StyleSheet.create({
    root: {
      minWidth: 36,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      minHeight: small ? 32 : 36,
      backgroundColor: transparent ? '#00000000' : '#000000A0',
    },
    rootFocus: {
      backgroundColor: theme.foreground,
    },
    rootWithLabel: {
      minWidth: small ? 64 : 96,
    },
    icon: {
      fontSize: small ? 11 : 14,
      color: theme.foreground,
    },
    iconFocus: {
      color: theme.background,
    },
    iconWithLabel: {
      marginLeft: small ? 12 : 16,
      marginRight: small ? -12 : -16,
    },
    label: {
      fontSize: small ? 11 : 14,
      textAlign: 'center',
      marginVertical: small ? 4 : 8,
      marginHorizontal: small ? 16 : 24,
      color: theme.foreground,
    },
    labelFocus: {
      color: theme.background,
    },
  })

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
      {icon &&
        (filled ? (
          <IconFilled
            name={icon}
            style={[
              styles.icon,
              focus && styles.iconFocus,
              children && styles.iconWithLabel,
            ]}
          />
        ) : (
          <Icon
            name={icon}
            style={[
              styles.icon,
              focus && styles.iconFocus,
              children && styles.iconWithLabel,
            ]}
          />
        ))}
      {children && (
        <Text
          numberOfLines={1}
          style={[styles.label, focus && styles.labelFocus]}
          fontWeight={700}
        >
          {children}
        </Text>
      )}
    </Pressable>
  )
}

export default Button
