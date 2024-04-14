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
import secsToTime from 'lib/secsToTime'
import Text from 'components/Text'
import Seekbar from 'components/Seekbar'
import CenterLoading from 'components/CenterLoading'
import LinearGradient from 'react-native-linear-gradient'
import Clock from 'components/Clock'
import PlayerButton from 'components/PlayerButton'
import Button from 'components/Button'
import sortStreams, { sortedStreams } from 'lib/sortStreams'

const Player = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Player'>) => {
  const { item, startFrom, streams: initStreams } = route.params
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

  const [streams, setStreams] = useState<sortedStreams>(null)
  const [videoStream, setVideoStream] = useState(initStreams.video)
  const [audioStream, setAudioStream] = useState(initStreams.audio)
  const [subtitleStream, setSubtitleStream] = useState(initStreams.subtitle)

  useEffect(() => {
    setSource(client.server + '/Videos/' + item.Id + '/stream?static=true')
    setStreams(sortStreams(item.MediaStreams))
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
        bufferConfig={{
          minBufferMs: 5000,
        }}
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

      <View
        style={{
          flex: 1,
          width: '100%',
          position: 'absolute',
          bottom: 0,
        }}
      >
        <LinearGradient
          colors={['#00000000', '#00000080']}
          style={{
            flex: 1,
            paddingHorizontal: 64,
            paddingTop: 64,
            paddingBottom: 16,
            gap: 8,
          }}
        >
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flex: 1, flexGrow: 1 }}>
              <Text style={{ fontSize: 32 }} fontWeight={700}>
                {item.Name}
              </Text>
              {'SeriesName' in item && (
                <Text style={{ fontSize: 24 }} fontWeight={500}>
                  {item.SeriesName +
                    ' ' +
                    (item.ParentIndexNumber === 0
                      ? 'Special'
                      : 'S' + item.ParentIndexNumber + ':E' + item.IndexNumber)}
                </Text>
              )}
            </View>
            <Clock
              style={{ fontSize: 24, verticalAlign: 'bottom' }}
              fontWeight={500}
            />
          </View>
          <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
            <View
              style={{ flex: 1, flexDirection: 'row', gap: 16, flexGrow: 1 }}
            >
              <PlayerButton icon={paused ? 'play' : 'pause'} focus={true} />
              <PlayerButton icon="cog" focus={false} />
            </View>
            {!!streams && (
              <Text style={{ fontSize: 16, verticalAlign: 'middle' }}>
                {streams.videos[videoStream].resolution +
                  streams.videos[videoStream].framerate +
                  ' ' +
                  streams.videos[videoStream].codec +
                  ' / ' +
                  streams.audios[audioStream].codecName +
                  (streams.audios[audioStream].layout !== 'Stereo'
                    ? ' ' + streams.audios[audioStream].layout
                    : '')}
              </Text>
            )}
          </View>
          <View style={{ flex: 1, flexDirection: 'row', gap: 32 }}>
            <Seekbar
              currentTime={currentTime}
              duration={duration}
              bufferTime={bufferTime}
              seeking={seeking}
              seekTime={0}
            />
            <Text style={{ fontSize: 16 }} fontWeight={500}>
              {secsToTime(currentTime) + ' / ' + secsToTime(duration)}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {buffering && <CenterLoading />}
    </View>
  )
}

export default Player
