import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import RootStackParamList from 'types/RootStackParamList'
import Video, {
  SelectedTrackType,
  SelectedVideoTrackType,
  VideoRef,
} from 'react-native-video'
import { useBackHandler } from '@react-native-community/hooks'
import { useQueryClient } from '@tanstack/react-query'
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
import sortStreams, { sortedStreams } from 'lib/sortStreams'
import { items, sessions } from 'jellyfin-api'
import PlaybackInfoQuery from 'jellyfin-api/lib/types/queries/PlaybackInfoQuery'
import deviceProfile from 'lib/deviceProfile'
import ProgressQuery, {
  ProgressStoppedQuery,
} from 'jellyfin-api/lib/types/queries/ProgressQuery'
import secsToTicks from 'lib/secsToTicks'
import useInterval from 'hooks/useInterval'
import formatPlayerCodec from 'lib/formatPlayerCodec'
import { getVideoSize } from 'lib/formatStream'

const Player = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Player'>) => {
  const { item, startFrom, streams: initStreams } = route.params
  const client = useClient()
  const theme = useTheme()
  const query = useQueryClient()

  const videoRef = useRef<VideoRef>(null)
  const [source, setSource] = useState<string>(null)
  const [buffering, setBuffering] = useState(true)
  const [paused, setPaused] = useState(false)
  const [seeking, setSeeking] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [bufferTime, setBufferTime] = useState(0)
  const [seekTime, setSeekTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const [streams, setStreams] = useState<sortedStreams>(null)
  const [videoStream, setVideoStream] = useState(initStreams.video)
  const [audioStream, setAudioStream] = useState(initStreams.audio)
  const [subtitleStream, setSubtitleStream] = useState(initStreams.subtitle)

  const [currentVideoCodec, setCurrentVideoCodec] = useState<string>(null)
  const [currentVideoResolution, setCurrentVideoResolution] =
    useState<string>(null)
  const [currentAudioCodec, setCurrentAudioCodec] = useState<string>(null)

  const [playMethod, setPlayMethod] = useState<
    'DirectPlay' | 'DirectStream' | 'Transcode'
  >('DirectPlay')
  const [playSession, setPlaySession] = useState<string>(null)

  useEffect(() => {
    const s = sortStreams(item.MediaStreams)
    setStreams(s)
    const profile = deviceProfile()
    const playbackInfo: PlaybackInfoQuery = {
      DeviceProfile: profile,
      MediaSourceId: item.Id,
      MaxStreamingBitrate: 50000000,
      MaxAudioChannels: 8,
      AudioStreamIndex: s.audios[initStreams.audio].id,
      SubtitleStreamIndex:
        initStreams.subtitle === -1 ? -1 : s.subtitles[initStreams.subtitle].id,
      EnableDirectPlay: true,
      EnableDirectStream: true,
      EnableTranscoding: true,
    }
    items.playbackInfo(client, item.Id, playbackInfo).then((res) => {
      setPlaySession(res.PlaySessionId)
      if (res.MediaSources[0].SupportsDirectPlay) {
        console.log('DIRECT PLAY')
        setPlayMethod('DirectPlay')
        setSource(client.server + '/Videos/' + item.Id + '/stream?Static=true')
      } else {
        if (res.MediaSources[0].SupportsDirectStream) {
          console.log('DIRECT STREAM')
          setPlayMethod('DirectStream')
        } else {
          console.log('TRANSCODING')
          setPlayMethod('Transcode')
        }
        setSource(client.server + res.MediaSources[0].TranscodingUrl)
        console.log(res)
        // console.log(res.MediaSources[0].MediaStreams)
      }
    })
  }, [])

  const [firstPause, setFirstPause] = useState(false)
  useEffect(() => {
    if (!firstPause) {
      setFirstPause(true)
    } else {
      console.log('PAUSE/UNPAUSE: ' + secsToTime(currentTime))
      playingProgress(paused ? 'pause' : 'unpause')
    }
  }, [paused])

  useInterval(() => {
    console.log('PROGRESS: ' + secsToTime(currentTime))
    playingProgress('timeupdate')
  }, 10_1000)

  const playingProgress = (
    event: 'timeupdate' | 'pause' | 'unpause' | undefined,
    position?: number,
  ) => {
    const payload: ProgressQuery = {
      CanSeek: true,
      ItemId: item.Id,
      MediaSourceId: item.Id,
      SessionId: playSession,
      PlaySessionId: playSession,
      EventName: event,
      IsPaused: paused,
      IsMuted: false,
      VolumeLevel: 100,
      PositionTicks: position
        ? secsToTicks(position)
        : currentTime === 0 && !!startFrom
        ? startFrom
        : secsToTicks(currentTime),
      PlayMethod: playMethod,
      RepeatMode: 'RepeatNone',
      AudioStreamIndex: streams.audios[initStreams.audio].id,
      SubtitleStreamIndex: streams.subtitles[initStreams.subtitle].id,
    }
    console.log(payload)
    if (event === undefined) {
      sessions.playing(client, payload)
    } else {
      sessions.playingProgress(client, payload)
    }
  }

  useBackHandler(() => {
    if (seeking) {
      setSeeking(false)
      return true
    } else {
      console.log('PLAYBACK END: ' + secsToTime(currentTime))
      playingStopped()
      return false
    }
  })

  const playingStopped = (failed: boolean = false) => {
    const payload: ProgressStoppedQuery = {
      ItemId: item.Id,
      MediaSourceId: item.Id,
      SessionId: playSession,
      PlaySessionId: playSession,
      PositionTicks:
        currentTime === 0 && !!startFrom ? startFrom : secsToTicks(currentTime),
      Failed: failed,
    }
    sessions.playingStopped(client, payload).then(() => {
      query.invalidateQueries({ queryKey: ['views'] })
      query.invalidateQueries({ queryKey: ['itemsResume'] })
      query.invalidateQueries({ queryKey: ['showsNextup'] })
      query.invalidateQueries({ queryKey: ['item', item.Id] })
      if (item.SeasonId)
        query.invalidateQueries({ queryKey: ['episodes', item.SeasonId] })
    })
  }

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
        onSeek={(e) => {
          console.log('SEEK: ' + secsToTime(e.currentTime))
          setCurrentTime(e.currentTime)
          playingProgress('timeupdate', e.currentTime)
        }}
        onLoad={(e) => {
          setDuration(e.duration)
          playingProgress(undefined, e.currentTime)
          if (!!startFrom) videoRef.current.seek(ticksToSecs(startFrom))
        }}
        onVideoTracks={(e) => {
          console.log(e)
          if (e.videoTracks.length > 0) {
            setCurrentVideoCodec(formatPlayerCodec(e.videoTracks[0].codecs))
            setCurrentVideoResolution(
              getVideoSize(e.videoTracks[0].width, e.videoTracks[0].height),
            )
          }
        }}
        onAudioTracks={(e) => {
          console.log(e)
          setCurrentAudioCodec(formatPlayerCodec(e.audioTracks[0].type))
        }}
        onEnd={() => {
          console.log('PLAYBACK END: ' + secsToTime(currentTime))
          playingStopped()
          navigation.pop()
        }}
        onError={(e) => {
          console.log(e.error.errorString)
          console.log(e.error.errorException)
          playingStopped(true)
          navigation.pop()
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
              <>
                {playMethod !== 'DirectPlay' && !!currentVideoCodec ? (
                  <Text style={{ fontSize: 16, verticalAlign: 'middle' }}>
                    {currentVideoResolution +
                      streams.videos[videoStream].framerate +
                      ' ' +
                      currentVideoCodec}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 16, verticalAlign: 'middle' }}>
                    {streams.videos[videoStream].resolution +
                      streams.videos[videoStream].framerate +
                      ' ' +
                      streams.videos[videoStream].codec}
                  </Text>
                )}
                <Text style={{ fontSize: 16, verticalAlign: 'middle' }}>/</Text>
                <Text style={{ fontSize: 16, verticalAlign: 'middle' }}>
                  {(playMethod === 'DirectPlay'
                    ? streams.audios[audioStream].codec
                    : currentAudioCodec) +
                    (streams.audios[audioStream].layout !== 'Stereo'
                      ? ' ' + streams.audios[audioStream].layout
                      : '')}
                </Text>

                {playMethod !== 'DirectPlay' && (
                  <>
                    <Text style={{ fontSize: 16, verticalAlign: 'middle' }}>
                      /
                    </Text>
                    <Text style={{ fontSize: 16, verticalAlign: 'middle' }}>
                      {playMethod === 'DirectStream'
                        ? 'Direct Stream'
                        : 'Transcoding'}
                    </Text>
                  </>
                )}
              </>
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
