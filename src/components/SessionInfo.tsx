import { View } from 'react-native'
import Text from './Text'
import Session from 'jellyfin-api/lib/types/sessions/Session'

interface Props {
  sessionInfo: Session
  playMethod: string
}

const bitsToMegabits = (bits: number) => {
  return Math.round(bits / 1000 / 100) / 10
}
const bitsToKilobits = (bits: number) => {
  return Math.round(bits / 100) / 10
}

const SessionInfo = ({ sessionInfo: info, playMethod }: Props) => {
  const audio = info.PlayState.AudioStreamIndex

  return (
    <View
      style={{
        backgroundColor: '#00000080',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <Text>Play method: {playMethod}</Text>
      <Text>
        Resolution:{' '}
        {!!info.TranscodingInfo
          ? info.TranscodingInfo.Width + '×' + info.TranscodingInfo.Height
          : info.NowPlayingItem.Width + '×' + info.NowPlayingItem.Height}
      </Text>

      {!!info.TranscodingInfo && (
        <View style={{ paddingTop: 8 }}>
          <Text fontWeight={700}>Transcoding Info</Text>
          <Text>Container: {info.TranscodingInfo.Container}</Text>
          <Text>Video codec: {info.TranscodingInfo.VideoCodec}</Text>
          <Text>Audio codec: {info.TranscodingInfo.AudioCodec}</Text>
          <Text>
            Bitrate: {bitsToMegabits(info.TranscodingInfo.Bitrate)} Mbps
          </Text>
          <Text>
            Reason: {info.TranscodingInfo.TranscodeReasons.join(', ')}
          </Text>
        </View>
      )}

      <View style={{ paddingTop: 8 }}>
        <Text fontWeight={700}>Original Media Info</Text>
        <Text>
          Video codec:{' '}
          {info.NowPlayingItem.MediaStreams[0].Codec +
            ' ' +
            info.NowPlayingItem.MediaStreams[0].Profile}
        </Text>
        <Text>
          Video bitrate:{' '}
          {bitsToMegabits(info.NowPlayingItem.MediaStreams[0].BitRate)} Mbps
        </Text>
        <Text>
          Video range: {info.NowPlayingItem.MediaStreams[0].VideoRangeType}
        </Text>
        <Text>
          Audio codec: {info.NowPlayingItem.MediaStreams[audio].Codec}
        </Text>
        <Text>
          Audio bitrate:{' '}
          {bitsToKilobits(info.NowPlayingItem.MediaStreams[audio].BitRate)} Kbps
        </Text>
        <Text>
          Audio channels: {info.NowPlayingItem.MediaStreams[audio].Channels}
        </Text>
        <Text>
          Audio sample rate:{' '}
          {info.NowPlayingItem.MediaStreams[audio].SampleRate}
        </Text>
      </View>
    </View>
  )
}

export default SessionInfo
