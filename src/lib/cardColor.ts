import tinycolor from 'tinycolor2'

const cardColor = (color: any) => {
  const base = tinycolor(color)
  const light = base.lighten((1.0 - base.getLuminance()) * 40)
  const final = light.darken(light.getLuminance() > 0.4 ? 40 : 0)
  return final.toHex8String()
}

export default cardColor
