// @ts-nocheck

import Text from 'components/Text'
import { useEffect, useState } from 'react'
import { SvgXml } from 'react-native-svg'

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
  const split = rating.substring(rating.indexOf('-') + 1)

  const width = 30
  const height = 20

  // Australia
  if (rating.startsWith('AU-') && split in au) {
    return <SvgXml xml={auIcons[au[split]]} width={width} height={height} />
  }

  // Japan
  if (rating.startsWith('JP-') && split in jp) {
    return <SvgXml xml={jpIcons[jp[split]]} width={width} height={height} />
  }

  // United Kingdom
  if (
    (rating.startsWith('UK-') && split in uk) ||
    (rating.startsWith('GB-') && split in uk)
  ) {
    return <SvgXml xml={ukIcons[uk[split]]} width={width} height={height} />
  }

  // United States
  if (rating.startsWith('US-') && split in us) {
    return <SvgXml xml={usIcons[us[split]]} width={width} height={height} />
  }
  if (rating in us) {
    return <SvgXml xml={usIcons[us[rating]]} width={width} height={height} />
  }

  // Fallback
  return <Text>{rating}</Text>
}

export default Classification
