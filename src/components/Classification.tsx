import Text from 'components/Text'
import { SvgXml } from 'react-native-svg'

import AU_G from 'assets/classification/au/G.svg'
import AU_PG from 'assets/classification/au/PG.svg'
import AU_M from 'assets/classification/au/M.svg'
import AU_MA from 'assets/classification/au/MA15+.svg'
import AU_R from 'assets/classification/au/R18+.svg'
import AU_X from 'assets/classification/au/X18+.svg'
import { View } from 'react-native'

interface Props {
  rating: string
}

const Classification = ({ rating }: Props) => {
  if (rating.startsWith('AU-')) {
    const r = rating.split('AU-', 2)[1]
    if (r === 'G') return <Icon icon={AU_G} />
    if (r === 'PG') return <Icon icon={AU_PG} />
    if (r === 'M') return <Icon icon={AU_M} />
    if (r === 'MA15+' || r === 'MA 15+') return <Icon icon={AU_MA} />
    if (r === 'R18+' || r === 'R 18+') return <Icon icon={AU_R} />
    if (r === 'X18+' || r === 'X 18+') return <Icon icon={AU_X} />
    return <Text>{rating}</Text>
  }

  return <Text>{rating}</Text>
}

const Icon = ({ icon }: { icon: string }) => {
  return <SvgXml xml={icon} width={30} height={20} />
}

export default Classification
