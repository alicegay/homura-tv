import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import {
  StyleSheet,
  TextInput as TextInputOrig,
  TextInputProps,
  Pressable,
} from 'react-native'
import useTheme from 'hooks/useTheme'
import tinycolor from 'tinycolor2'

interface TypeInputHandle extends TextInputOrig {
  focus: () => void | null
  blur: () => void | null
}

const TextInput = forwardRef<Partial<TypeInputHandle>, TextInputProps>(
  ({ style, ...props }: TextInputProps, ref) => {
    useImperativeHandle(ref, () => ({
      focus: () => {
        textRef.current.focus()
      },
      blur: () => {
        textRef.current.blur()
      },
    }))

    const theme = useTheme()

    const [focus, setFocus] = useState(false)
    const textRef = useRef<TextInputOrig>()

    const styles = StyleSheet.create({
      input: {
        backgroundColor: tinycolor(theme.background).lighten(10).toHex8String(),
        color: theme.foreground,
        fontFamily: theme.font500,
        borderRadius: 32,
        overflow: 'hidden',
        paddingHorizontal: 16,
        paddingVertical: 4,
      },
      focus: {
        backgroundColor: theme.foreground,
        color: theme.background,
      },
    })

    return (
      <Pressable
        // @ts-ignore
        ref={ref}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onPress={() => textRef.current.focus()}
      >
        <TextInputOrig
          ref={textRef}
          placeholderTextColor="#888"
          {...props}
          style={[styles.input, focus && styles.focus, style]}
        />
      </Pressable>
    )
  },
)

export default TextInput
