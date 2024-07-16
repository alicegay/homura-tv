import { StyleSheet, View } from 'react-native'
import useTheme from 'hooks/useTheme'
import { Icon, IconFilled } from './Icon'

interface Props {
  focus: boolean
  icon: string
  filled?: boolean
}

const PlayerButton = ({ focus, icon, filled = false }: Props) => {
  const theme = useTheme()

  const styles = StyleSheet.create({
    view: {
      width: 36,
      height: 36,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      backgroundColor: 'transparent',
    },
    focus: {
      backgroundColor: theme.foreground,
    },
    icon: {
      fontSize: 14,
      color: theme.foreground,
    },
    iconFocus: {
      color: theme.background,
    },
  })

  return (
    <View style={[styles.view, focus && styles.focus]}>
      {filled ? (
        <IconFilled
          name={icon}
          style={[styles.icon, focus && styles.iconFocus]}
        />
      ) : (
        <Icon name={icon} style={[styles.icon, focus && styles.iconFocus]} />
      )}
    </View>
  )
}

export default PlayerButton
