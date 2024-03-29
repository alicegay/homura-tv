import useThemeStore from 'hooks/useThemeStore'
import { ReactNode } from 'react'
import { Text as TextRN, StyleProp, TextStyle } from 'react-native'

interface Props {
  children: ReactNode
  numberOfLines?: number
  fontWeight?: 400 | 500 | 700
  style?: StyleProp<TextStyle>
}

const Text = ({
  children,
  numberOfLines = 1,
  fontWeight = 400,
  style,
}: Props) => {
  const theme = useThemeStore()

  return (
    <TextRN
      numberOfLines={numberOfLines}
      style={[
        {
          color: theme.foreground,
          fontSize: 14,
          fontFamily:
            fontWeight === 400
              ? theme.font400
              : fontWeight === 500
              ? theme.font500
              : theme.font700,
        },
        style,
      ]}
    >
      {children}
    </TextRN>
  )
}

export default Text
