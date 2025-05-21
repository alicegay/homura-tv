import useTheme from 'hooks/useTheme'
import { ReactNode } from 'react'
import {
  Text as TextRN,
  StyleProp,
  TextStyle,
  NativeSyntheticEvent,
  TextLayoutEventData,
} from 'react-native'

interface Props {
  children: ReactNode
  numberOfLines?: number
  fontWeight?: 400 | 500 | 700
  style?: StyleProp<TextStyle>
  onTextLayout?: (event: NativeSyntheticEvent<TextLayoutEventData>) => void
}

const Text = ({
  children,
  numberOfLines = 1,
  fontWeight = 400,
  style,
  onTextLayout,
}: Props) => {
  const theme = useTheme()

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
      onTextLayout={onTextLayout}
    >
      {children}
    </TextRN>
  )
}

export default Text
