import { useEffect, useRef, useState } from 'react'
import {
  HWEvent,
  Pressable,
  ToastAndroid,
  View,
  useTVEventHandler,
} from 'react-native'
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
import useSettings from 'hooks/useSettings'
import useInterval from 'hooks/useInterval'
import { ticksToSecs } from 'lib/ticksToTime'
import secsToTime from 'lib/secsToTime'
import secsToTicks from 'lib/secsToTicks'
import formatPlayerCodec from 'lib/formatPlayerCodec'
import { getVideoSize } from 'lib/formatStream'
import sortStreams, { sortedStreams } from 'lib/sortStreams'
import Text from 'components/Text'
import Seekbar from 'components/Seekbar'
import CenterLoading from 'components/CenterLoading'
import Clock from 'components/Clock'
import PlayerButton from 'components/PlayerButton'
import LinearGradient from 'react-native-linear-gradient'
import { items, other, sessions } from 'jellyfin-api'
import PlaybackInfoQuery from 'jellyfin-api/lib/types/queries/PlaybackInfoQuery'
import ProgressQuery, {
  ProgressStoppedQuery,
} from 'jellyfin-api/lib/types/queries/ProgressQuery'
import Session from 'jellyfin-api/lib/types/sessions/Session'
import SessionInfo from 'components/SessionInfo'
import PlayerTime from 'components/PlayerTime'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import IntroTimestamps from 'jellyfin-api/lib/types/other/IntroTimestamps'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { AxiosError } from 'axios'

let menuX = 0
let menuY = 0
let seekTime = 0
let longSeekLeft = 0
let longSeekRight = 0

const Player = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Player'>) => {
  const TVEventHandler = ({ eventType: button }: HWEvent) => {
    if (introVisibility) {
      if (button == 'select') {
        videoRef.current.seek(introTimestamps.IntroEnd)
      } else if (button == 'up' || button == 'down') {
        setIntroVisibility(false)
        menuY += 1
        resetControlsTimeout()
      }
    } else {
      if (
        (button == 'select' && menuY == -1) ||
        (button == 'select' && menuY == 0 && menuX == 0)
      ) {
        setPaused(!paused)
      } else if (button == 'up' && menuY >= 0 && !seeking) {
        menuY -= 1
        resetControlsTimeout()
      } else if (
        (button == 'down' && menuY < 1 && !seeking) ||
        (button == 'up' && menuY == -1 && !seeking)
      ) {
        menuY += 1
        resetControlsTimeout()
      }
    }

    if (button == 'left' && menuY == 0) {
      menuX = 0
    } else if (button == 'right' && menuY == 0) {
      menuX = 1
    }
    if (button == 'select' && menuX == 1) {
      setShowSessionInfo(!showSessionInfo)
    }

    // SEEKING
    if (
      (button == 'left' && menuY == 1) ||
      (button == 'right' && menuY == 1) ||
      (button == 'longLeft' && menuY == 1) ||
      (button == 'longRight' && menuY == 1) ||
      (button == 'left' && menuY == -1) ||
      (button == 'right' && menuY == -1)
    ) {
      if (menuY == -1) {
        menuX = 0
        menuY = 1
      }
      if (!seeking) {
        seekTime = currentTime
        longSeekLeft = 0
        longSeekRight = 0
        setSeeking(true)
        clearControlsTimeout()
      }
      if (button == 'left') {
        let toSeek = seekTime - 5
        if (toSeek < 0) toSeek = 0
        seekTime = toSeek
        longSeekLeft = 0
        longSeekRight = 0
      } else if (button == 'right') {
        let toSeek = seekTime + 5
        if (toSeek > duration) toSeek = duration
        seekTime = toSeek
        longSeekLeft = 0
        longSeekRight = 0
      } else if (button == 'longLeft') {
        let toSeek = seekTime - 5 - longSeekLeft * 2.5
        if (toSeek < 0) toSeek = 0
        seekTime = toSeek
        longSeekLeft += 1
        longSeekRight = 0
      } else if (button == 'longRight') {
        let toSeek = seekTime + 5 + longSeekRight * 2.5
        if (toSeek > duration) toSeek = duration
        seekTime = toSeek
        longSeekLeft = 0
        longSeekRight += 1
      }
      setSeekTime(seekTime)
    }
    if (button == 'select' && seeking) {
      setSeeking(false)
      videoRef.current.seek(seekTime)
      resetControlsTimeout()
    }

    if (menuY == -1 && controlsVisibility) {
      setControlsVisibility(false)
    } else if (menuY >= 0 && !controlsVisibility) {
      setControlsVisibility(true)
    }

    if (menuY == 0 && menuX == 0) {
      setPlayPauseButton(true)
    } else {
      setPlayPauseButton(false)
    }
    if (menuY == 0 && menuX == 1) {
      setInfoButton(true)
    } else {
      setInfoButton(false)
    }
  }
  useTVEventHandler(TVEventHandler)

  const [playPauseButton, setPlayPauseButton] = useState(true)
  const [infoButton, setInfoButton] = useState(false)

  const controlsTimeout = useRef(null)
  const setControlsTimeout = () => {
    controlsTimeout.current = setTimeout(() => {
      menuY = -1
      setControlsVisibility(false)
    }, 5_000)
  }
  const clearControlsTimeout = () => {
    clearTimeout(controlsTimeout.current)
  }
  const resetControlsTimeout = () => {
    clearControlsTimeout()
    setControlsTimeout()
  }

  const [controlsVisibility, setControlsVisibility] = useState(true)
  const controlsAnim = useSharedValue(1)
  const controlsView = useAnimatedStyle(() => ({
    bottom: 0 - (1 - controlsAnim.value) * 32,
  }))
  useEffect(() => {
    if (controlsVisibility) {
      controlsAnim.value = withTiming(1, {
        duration: 100,
        easing: Easing.out(Easing.quad),
      })
    } else {
      controlsAnim.value = withTiming(0, {
        duration: 100,
        easing: Easing.in(Easing.quad),
      })
    }
  }, [controlsVisibility])

  const { item, startFrom, streams: initStreams } = route.params
  const client = useClient()
  const theme = useTheme()
  const settings = useSettings()
  const query = useQueryClient()

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

  const [currentVideoCodec, setCurrentVideoCodec] = useState<string>(null)
  const [currentVideoResolution, setCurrentVideoResolution] =
    useState<string>(null)
  const [currentAudioCodec, setCurrentAudioCodec] = useState<string>(null)

  const [playMethod, setPlayMethod] = useState<
    'DirectPlay' | 'DirectStream' | 'Transcode'
  >('DirectPlay')
  const [playSession, setPlaySession] = useState<string>(null)
  const [bitrate, setBitrate] = useState<number>(null)
  const [sessionInfo, setSessionInfo] = useState<Session>(null)
  const [showSessionInfo, setShowSessionInfo] = useState(false)

  const [introTimestamps, setIntroTimestamps] = useState<IntroTimestamps>(null)
  const [introVisibility, setIntroVisibility] = useState(false)
  const introAnim = useSharedValue(0.0)
  useEffect(() => {
    if (introVisibility) {
      introAnim.value = withTiming(1.0, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      })
    } else {
      introAnim.value = withTiming(0.0, {
        duration: 200,
        easing: Easing.in(Easing.quad),
      })
    }
  }, [introVisibility])

  useEffect(() => {
    menuX = 0
    menuY = 0
    setControlsTimeout()

    const s = sortStreams(item.MediaStreams)
    setStreams(s)
    const playbackInfo: PlaybackInfoQuery = {
      DeviceProfile: settings.deviceProfile,
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
      setBitrate(res.MediaSources[0].Bitrate)
      if (res.MediaSources[0].SupportsDirectPlay) {
        //console.log('DIRECT PLAY')
        setPlayMethod('DirectPlay')
        setSource(client.server + '/Videos/' + item.Id + '/stream?Static=true')
      } else {
        if (res.MediaSources[0].SupportsDirectStream) {
          //console.log('DIRECT STREAM')
          setPlayMethod('DirectStream')
        } else {
          //console.log('TRANSCODING')
          setPlayMethod('Transcode')
        }
        setSource(client.server + res.MediaSources[0].TranscodingUrl)
        // console.log(res)
        // console.log(res.MediaSources[0].MediaStreams)
      }
    })
    if (item.Type === 'Episode' && settings.introSkipper) {
      other.introTimestamps(client, item.Id).then(
        (res) => {
          setIntroTimestamps(res)
          console.log(
            'Intro Skipper: ' +
              res.ShowSkipPromptAt.toString() +
              ' - ' +
              res.HideSkipPromptAt.toString(),
          )
        },
        (error: AxiosError) => {
          console.log('No Intro Skipper data')
        },
      )
    }
  }, [])

  const [firstPause, setFirstPause] = useState(false)
  useEffect(() => {
    if (!firstPause) {
      setFirstPause(true)
    } else {
      //console.log('PAUSE/UNPAUSE: ' + secsToTime(currentTime))
      playingProgress(paused ? 'pause' : 'unpause')
    }
  }, [paused])

  useInterval(() => {
    //console.log('PROGRESS: ' + secsToTime(currentTime))
    playingProgress('timeupdate')
  }, 10_0000)

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
      SubtitleStreamIndex:
        initStreams.subtitle === -1
          ? -1
          : streams.subtitles[initStreams.subtitle].id,
    }
    if (event === undefined) {
      sessions.playing(client, payload)
    } else {
      sessions.playingProgress(client, payload)
    }
  }

  useBackHandler(() => {
    if (seeking) {
      setSeeking(false)
      resetControlsTimeout()
      return true
    } else {
      //console.log('PLAYBACK END: ' + secsToTime(currentTime))
      playingStopped()
      clearControlsTimeout()
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
      <Pressable style={{ width: 0, height: 0 }} hasTVPreferredFocus={true} />

      {!!source && (
        <Video
          ref={videoRef}
          source={{
            uri: source,
          }}
          useTextureView={false}
          focusable={false}
          paused={seeking ? true : paused}
          resizeMode="contain"
          selectedVideoTrack={{
            type: SelectedVideoTrackType.INDEX,
            // @ts-ignore
            value: playMethod !== 'DirectPlay' ? '0' : videoStream.toString(),
          }}
          selectedAudioTrack={{
            type: SelectedTrackType.INDEX,
            value: playMethod !== 'DirectPlay' ? '0' : audioStream.toString(),
          }}
          selectedTextTrack={
            subtitleStream === -1 || playMethod !== 'DirectPlay'
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
              if (!!introTimestamps) {
                if (
                  e.currentTime > introTimestamps.ShowSkipPromptAt &&
                  e.currentTime < introTimestamps.HideSkipPromptAt &&
                  !introVisibility &&
                  !controlsVisibility
                ) {
                  setIntroVisibility(true)
                } else if (
                  (e.currentTime < introTimestamps.ShowSkipPromptAt &&
                    introVisibility) ||
                  (e.currentTime > introTimestamps.HideSkipPromptAt &&
                    introVisibility)
                ) {
                  setIntroVisibility(false)
                }
              }
            }
          }}
          onSeek={(e) => {
            //console.log('SEEK: ' + secsToTime(e.currentTime))
            setCurrentTime(e.currentTime)
            playingProgress('timeupdate', e.currentTime)
          }}
          onLoad={(e) => {
            setDuration(e.duration)
            playingProgress(undefined, e.currentTime)
            if (!!startFrom) videoRef.current.seek(ticksToSecs(startFrom))
            sessions
              .sessions(client, { deviceId: client.deviceID })
              .then((r) => {
                if (r.length > 0) {
                  setSessionInfo(r[0])
                  if (
                    r[0].PlayState.PlayMethod !== 'DirectPlay' &&
                    'TranscodingInfo' in r[0] &&
                    r[0].TranscodingInfo.IsVideoDirect
                  )
                    setPlayMethod('DirectStream')
                  if ('TranscodingInfo' in r[0])
                    setBitrate(r[0].TranscodingInfo.Bitrate)
                }
              })
          }}
          onVideoTracks={(e) => {
            //console.log(e)
            if (e.videoTracks.length > 0) {
              setCurrentVideoCodec(formatPlayerCodec(e.videoTracks[0].codecs))
              setCurrentVideoResolution(
                getVideoSize(e.videoTracks[0].width, e.videoTracks[0].height),
              )
            }
          }}
          onAudioTracks={(e) => {
            //console.log(e)
            setCurrentAudioCodec(formatPlayerCodec(e.audioTracks[0].type))
          }}
          onEnd={() => {
            //console.log('PLAYBACK END: ' + secsToTime(currentTime))
            playingStopped()
            clearControlsTimeout()
            navigation.pop()
          }}
          onError={(e) => {
            console.log(e.error.errorString)
            console.log(e.error.errorException)
            ToastAndroid.show(e.error.errorString, ToastAndroid.LONG)
            playingStopped(true)
            clearControlsTimeout()
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
      )}

      <Animated.View
        style={[
          {
            flex: 1,
            width: '100%',
            position: 'absolute',
            bottom: 0,
          },
          {
            opacity: controlsAnim,
          },
          controlsView,
        ]}
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
                <Text style={{ fontSize: 20 }} fontWeight={500}>
                  {item.SeriesName +
                    ' ' +
                    (item.ParentIndexNumber === 0
                      ? 'Special'
                      : 'S' + item.ParentIndexNumber + ':E' + item.IndexNumber)}
                </Text>
              )}
              {item.Type === 'MusicVideo' &&
                'Artists' in item &&
                item.Artists.length > 0 && (
                  <Text style={{ fontSize: 20 }} fontWeight={500}>
                    {item.Artists.join(', ')}
                  </Text>
                )}
            </View>
            <Clock
              style={{ fontSize: 24, verticalAlign: 'bottom' }}
              fontWeight={500}
            />
          </View>
          <View style={{ flex: 1, flexDirection: 'row', gap: 12 }}>
            <View
              style={{ flex: 1, flexDirection: 'row', gap: 16, flexGrow: 1 }}
            >
              <PlayerButton
                icon={paused ? 'play' : 'pause'}
                focus={playPauseButton}
              />
              <PlayerButton icon="information" focus={infoButton} />
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

                {!!bitrate && (
                  <>
                    <Text style={{ fontSize: 16, verticalAlign: 'middle' }}>
                      /
                    </Text>
                    <Text style={{ fontSize: 16, verticalAlign: 'middle' }}>
                      {(Math.round(bitrate / 1000 / 100) / 10).toString() +
                        ' Mbps'}
                    </Text>
                  </>
                )}
              </>
            )}
          </View>
          <View style={{ flex: 1, flexDirection: 'row', gap: 32 }}>
            <Seekbar
              currentTime={seeking ? seekTimeState : currentTime}
              duration={duration}
              bufferTime={bufferTime}
              seeking={seeking}
              selected={menuY == 1}
            />
            <PlayerTime
              currentTime={seeking ? seekTimeState : currentTime}
              duration={duration}
            />
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View
        style={{
          opacity: introAnim,
          position: 'absolute',
          bottom: 32,
          right: 64,
          width: 160,
          height: 36,
          backgroundColor: theme.foreground,
          borderRadius: 20,
          overflow: 'hidden',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          style={{ fontSize: 14, color: theme.background, paddingRight: 4 }}
          name="skip-next"
        />
        <Text
          style={{ fontSize: 14, color: theme.background }}
          fontWeight={700}
        >
          Skip Opening
        </Text>
      </Animated.View>

      <View style={{ position: 'absolute', top: 16, left: 64 }}>
        {showSessionInfo && !!sessionInfo && (
          <SessionInfo sessionInfo={sessionInfo} playMethod={playMethod} />
        )}
      </View>

      {buffering && <CenterLoading />}
    </View>
  )
}

export default Player
