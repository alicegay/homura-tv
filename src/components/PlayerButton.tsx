import { forwardRef, useImperativeHandle, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import useTheme from 'hooks/useTheme'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

interface Props {
  focus: boolean
  icon: string
}

const PlayerButton = ({ focus, icon }: Props) => {
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
      <Icon name={icon} style={[styles.icon, focus && styles.iconFocus]} />
    </View>
  )
}

export default PlayerButton
