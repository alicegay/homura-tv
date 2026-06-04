import { ReactNode, Ref, useState } from 'react'
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
import { Icon, IconFilled } from './Icon'

interface Props {
  title: string
  subtitle?: string
  transparent?: boolean
  icon?: string
  iconRight?: string
  filled?: boolean
  right?: () => ReactNode
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
  ref?: Ref<View>
}

const ListButton = ({
  title,
  subtitle,
  transparent = false,
  icon,
  iconRight,
  filled = false,
  right,
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
  ref,
}: Props) => {
  const theme = useTheme()
  const [focus, setFocus] = useState(false)

  const styles = StyleSheet.create({
    root: {
      backgroundColor: transparent ? '#00000000' : '#000000A0',
      overflow: 'hidden',
      borderRadius: 38,
      flex: 1,
      flexDirection: 'row',
      paddingHorizontal: 24,
      paddingVertical: 16,
      alignItems: 'center',
    },
    rootFocus: {
      backgroundColor: theme.foreground,
    },
    icon: {
      fontSize: 20,
      color: theme.foreground,
      paddingRight: 12,
    },
    iconRight: {
      fontSize: 20,
      color: theme.foreground,
      paddingLeft: 12,
    },
    title: {
      fontSize: 14,
      fontFamily: theme.font700,
      color: theme.foreground,
    },
    subtitle: {
      fontSize: 11,
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
      {icon &&
        (filled ? (
          <IconFilled
            name={icon}
            style={[styles.icon, focus && styles.labelFocus]}
          />
        ) : (
          <Icon name={icon} style={[styles.icon, focus && styles.labelFocus]} />
        ))}
      <View style={{ flex: 1, flexDirection: 'column', flexGrow: 1 }}>
        <Text
          style={[styles.title, focus && styles.labelFocus]}
          numberOfLines={2}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text style={[styles.subtitle, focus && styles.labelFocus]}>
            {subtitle}
          </Text>
        )}
      </View>
      {iconRight &&
        (filled ? (
          <IconFilled
            name={iconRight}
            style={[styles.iconRight, focus && styles.labelFocus]}
          />
        ) : (
          <Icon
            name={iconRight}
            style={[styles.iconRight, focus && styles.labelFocus]}
          />
        ))}
      {!!right && right()}
    </Pressable>
  )
}

export default ListButton
