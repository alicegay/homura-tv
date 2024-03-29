import { Blurhash } from 'react-native-blurhash'

const averageBlurhash = (blurhash: string) => {
  const rgb = Blurhash.getAverageColor(blurhash)
  // return 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')'
  return (
    '#' +
    ('0' + Math.round(rgb.r).toString(16)).slice(-2) +
    ('0' + Math.round(rgb.g).toString(16)).slice(-2) +
    ('0' + Math.round(rgb.b).toString(16)).slice(-2)
  )
}

export default averageBlurhash
