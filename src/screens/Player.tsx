import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import RootStackParamList from 'types/RootStackParamList'
import Video, {
  SelectedTrackType,
  SelectedVideoTrackType,
  VideoRef,
} from 'react-native-video'
import useClient from 'hooks/useClient'
import useTheme from 'hooks/useTheme'
import { ticksToSecs } from 'lib/ticksToTime'
import CenterLoading from 'components/CenterLoading'

const Player = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Player'>) => {
  const { item, startFrom, streams } = route.params
  const client = useClient()
  const theme = useTheme()

  const videoRef = useRef<VideoRef>(null)
  const [source, setSource] = useState<string>(null)
  const [buffering, setBuffering] = useState(true)
  const [paused, setPaused] = useState(false)
  const [seeking, setSeeking] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [bufferTime, setBufferTime] = useState(0)
  const [seekTimeState, setSeekTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const [videoStream, setVideoStream] = useState(streams.video)
  const [audioStream, setAudioStream] = useState(streams.audio)
  const [subtitleStream, setSubtitleStream] = useState(streams.subtitle)

  useEffect(() => {
    setSource(client.server + '/Videos/' + item.Id + '/stream?static=true')
  }, [])

  return (
    <View style={{ backgroundColor: '#000', width: '100%', height: '100%' }}>
      <Video
        ref={videoRef}
        source={{
          uri: source,
        }}
        useTextureView={false}
        paused={seeking ? true : paused}
        resizeMode="contain"
        selectedVideoTrack={{
          type: SelectedVideoTrackType.INDEX,
          // @ts-ignore
          value: videoStream.toString(),
        }}
        selectedAudioTrack={{
          type: SelectedTrackType.INDEX,
          value: audioStream.toString(),
        }}
        selectedTextTrack={
          subtitleStream === -1
            ? { type: SelectedTrackType.DISABLED }
            : {
                type: SelectedTrackType.INDEX,
                value: subtitleStream.toString(),
              }
        }
        onBuffer={(e) => {
          setBuffering(e.isBuffering)
        }}
        onProgress={(e) => {
          if (!seeking) {
            setCurrentTime(e.currentTime)
            setBufferTime(e.playableDuration)
          }
        }}
        onSeek={(e) => {}}
        onLoad={(e) => {
          setDuration(e.duration)
          if (!!startFrom) {
            videoRef.current.seek(ticksToSecs(startFrom))
          }
        }}
        onError={(e) => {
          console.log(e.error.errorString)
          console.log(e.error.errorException)
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      />
      {buffering && <CenterLoading />}
    </View>
  )
}

export default Player
