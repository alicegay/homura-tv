// @ts-nocheck

import Text from 'components/Text'
import { SvgXml } from 'react-native-svg'
import useSettings from 'hooks/useSettings'

import au from 'classification/au'
import jp from 'classification/jp'
import uk from 'classification/uk'
import us from 'classification/us'

import * as auIcons from 'assets/classification/au'
import * as jpIcons from 'assets/classification/jp'
import * as ukIcons from 'assets/classification/uk'
import * as usIcons from 'assets/classification/us'

interface Props {
  rating: string
}

const Classification = ({ rating }: Props) => {
  const settings = useSettings()

  const split = rating.substring(rating.indexOf('-') + 1)

  const width = 30
  const height = 20

  // Australia
  if (
    (rating.startsWith('AU-') && split in au && au[split] in auIcons) ||
    (settings.classification === 'au' && rating in au && au[rating] in auIcons)
  ) {
    return <SvgXml xml={auIcons[au[split]]} width={width} height={height} />
  }

  // Japan
  if (
    (rating.startsWith('JP-') && split in jp && jp[split] in jpIcons) ||
    (settings.classification === 'jp' && rating in jp && jp[rating] in jpIcons)
  ) {
    return <SvgXml xml={jpIcons[jp[split]]} width={width} height={height} />
  }

  // United Kingdom
  if (
    (rating.startsWith('UK-') && split in uk && uk[split] in ukIcons) ||
    (rating.startsWith('GB-') && split in uk && uk[split] in ukIcons) ||
    (settings.classification === 'uk' &&
      rating in uk &&
      uk[split] in ukIcons) ||
    (settings.classification === 'gb' && rating in uk && uk[split] in ukIcons)
  ) {
    return <SvgXml xml={ukIcons[uk[split]]} width={width} height={height} />
  }

  // United States
  if (
    (rating.startsWith('US-') && split in us && us[split] in usIcons) ||
    (rating in us && us[rating] in usIcons)
  ) {
    return <SvgXml xml={usIcons[us[split]]} width={width} height={height} />
  }

  // Text Fallback
  return <Text>{rating}</Text>
}

export default Classification
