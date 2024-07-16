import { createIconSet } from 'react-native-vector-icons'
import glyphmap from 'assets/MaterialSymbolsGlyphmap.json'

export const Icon = createIconSet(
  glyphmap,
  'Material Symbols Rounded Regular',
  'MaterialSymbolsRounded-Regular.ttf',
)

export const IconFilled = createIconSet(
  glyphmap,
  'Material Symbols Rounded Filled Regular',
  'MaterialSymbolsRounded_Filled-Regular.ttf',
)
