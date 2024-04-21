import { View } from 'react-native'
import Text from './Text'
import secsToTime from 'lib/secsToTime'

interface Props {
  currentTime: number
  duration: number
}

const PlayerTime = ({ currentTime, duration }: Props) => {
  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Text style={{ fontSize: 16 }} fontWeight={500}>
        {secsToTime(currentTime)}
      </Text>
      <Text style={{ fontSize: 16 }} fontWeight={500}>
        /
      </Text>
      <Text style={{ fontSize: 16 }} fontWeight={500}>
        {secsToTime(duration)}
      </Text>
    </View>
  )
}

export default PlayerTime
