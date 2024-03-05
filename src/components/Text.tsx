import useThemeStore from 'hooks/useThemeStore'
import { ReactNode } from 'react'
import { Text as TextRN, StyleProp, TextStyle } from 'react-native'

interface Props {
  children: ReactNode
  numberOfLines?: number
  style?: StyleProp<TextStyle>
}

const Text = ({ children, numberOfLines = 1, style }: Props) => {
  const theme = useThemeStore()

  return (
    <TextRN
      numberOfLines={numberOfLines}
      style={[
        {
          color: theme.foreground,
          fontSize: 14,
        },
        style,
      ]}
    >
      {children}
    </TextRN>
  )
}

export default Text
