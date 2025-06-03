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
  ViewType,
} from 'react-native-video'
import { useBackHandler } from '@react-native-community/hooks'
import { useQueryClient } from '@tanstack/react-query'
import useClient from 'hooks/useClient'
import useTheme from 'hooks/useTheme'
import useSettings from 'hooks/useSettings'
import useInterval from 'hooks/useInterval'
import { ticksToSecs } from 'lib/ticksToTime'
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
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { IntroSegments } from 'jellyfin-api/lib/types/other/IntroTimestamps'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { AxiosError } from 'axios'
import WebView, { WebViewMessageEvent } from 'react-native-webview'

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
    if (introVisibility || creditVisibility) {
      if (button == 'select') {
        if (creditVisibility) {
          videoRef.current.seek(introSegments.Credits.IntroEnd)
        } else {
          videoRef.current.seek(introSegments.Introduction.IntroEnd)
        }
      } else if (button == 'up' || button == 'down') {
        setIntroVisibility(false)
        setCreditVisibility(false)
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
  const webviewRef = useRef<WebView>(null)
  const [source, setSource] = useState<string>(null)
  const [buffering, setBuffering] = useState(true)
  const [paused, setPaused] = useState(false)
  const [seeking, setSeeking] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [bufferTime, setBufferTime] = useState(0)
  const [seekTimeState, setSeekTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [webviewReady, setWebviewReady] = useState(false)
  const [subtitleLoad, setSubtitleLoad] = useState<{
    subtitle: string
    attachments: string[]
    width: number
    height: number
    framerate: number
  }>(null)

  const streams = sortStreams(item.MediaStreams)
  const videoStream = initStreams.video
  const audioStream = initStreams.audio
  const subtitleStream = initStreams.subtitle
  const subtitleIndex =
    subtitleStream === -1 ? -1 : streams.subtitles[subtitleStream].id
  const subtitleCodecs = {
    srt: 'srt',
    vtt: 'srt',
    subrip: 'srt',
    ssa: 'ass',
    ass: 'ass',
    pgs: 'pgs',
    pgssub: 'pgs',
    dvdsubs: 'pgs',
  }
  const subtitleCodec: 'srt' | 'ass' | 'pgs' =
    subtitleStream === -1
      ? null
      : subtitleCodecs[streams.subtitles[subtitleStream].codec.toLowerCase()]
  const useLibass = subtitleCodec === 'ass' && !settings.burninASS
  const [fontsReady, setFontsReady] = useState(useLibass ? false : true)
  const [fontProgress, setFontProgress] = useState<string>(null)

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

  const [introSegments, setIntroSegments] = useState<IntroSegments>(null)
  const [introVisibility, setIntroVisibility] = useState(false)
  const [creditVisibility, setCreditVisibility] = useState(false)
  const [introLabel, setIntroLabel] = useState('Skip Opening')
  useEffect(() => {
    if (introVisibility || creditVisibility) {
      if (introVisibility) {
        setIntroLabel('Skip Opening')
      } else {
        setIntroLabel('Skip Ending')
      }
    }
  }, [introVisibility, creditVisibility])

  useEffect(() => {
    menuX = 0
    menuY = 0
    setControlsTimeout()

    const playbackInfo: PlaybackInfoQuery = {
      DeviceProfile: settings.deviceProfile,
      MediaSourceId: item.Id,
      MaxStreamingBitrate: 50000000,
      MaxAudioChannels: 8,
      AudioStreamIndex: streams.audios[initStreams.audio].id,
      SubtitleStreamIndex: subtitleIndex,
      EnableDirectPlay: true,
      EnableDirectStream: true,
      EnableTranscoding: true,
    }
    items.playbackInfo(client, item.Id, playbackInfo).then((res) => {
      console.log(res)
      const mediaSource = res.MediaSources[0]
      setPlaySession(res.PlaySessionId)
      setBitrate(mediaSource.Bitrate)
      if (mediaSource.SupportsDirectPlay) {
        setPlayMethod('DirectPlay')
        setSource(client.server + '/Videos/' + item.Id + '/stream?Static=true')
      } else {
        if (mediaSource.SupportsDirectStream) {
          setPlayMethod('DirectStream')
        } else {
          setPlayMethod('Transcode')
        }
        setSource(client.server + mediaSource.TranscodingUrl)
      }
      if (useLibass) {
        console.log('LIBASS ENABLED')
        const subtitle =
          client.server + mediaSource.MediaStreams[subtitleIndex].DeliveryUrl
        let attachments = []
        try {
          for (let i = 0; i < mediaSource.MediaAttachments.length; i++) {
            const attachment = mediaSource.MediaAttachments[i]
            const allowedMimes = [
              'font/otf',
              'font/ttf',
              'font/woff',
              'font/woff2',
              'application/vnd.ms-opentype',
              'application/vnd.ms-fontobject',
              'application/x-truetype-font',
              'application/x-font-truetype',
              'application/x-font-ttf',
              'application/x-font-opentype',
              'application/font-woff',
              'application/font-woff2',
              'application/font-sfnt',
            ]
            if (allowedMimes.includes(attachment.MimeType.toLowerCase())) {
              attachments.push(client.server + attachment.DeliveryUrl)
            }
          }
        } catch {}
        const videoIndex = streams.videos[videoStream].id
        setSubtitleLoad({
          subtitle: subtitle,
          attachments: attachments,
          width: mediaSource.MediaStreams[videoIndex].Width,
          height: mediaSource.MediaStreams[videoIndex].Height,
          framerate: mediaSource.MediaStreams[videoIndex].AverageFrameRate,
        })
      }
    })
    if (item.Type === 'Episode' && settings.introSkipper) {
      other.introTimestamps(client, item.Id).then(
        (res) => {
          setIntroSegments(res)
        },
        (error: AxiosError) => {
          console.log('No Intro Skipper data')
        },
      )
    }
  }, [])

  useEffect(() => {
    if (webviewReady && subtitleLoad) {
      sendMessage({
        event: 'load',
        ...subtitleLoad,
      })
    }
  }, [webviewReady, subtitleLoad])

  const [firstPause, setFirstPause] = useState(false)
  useEffect(() => {
    if (!firstPause) {
      setFirstPause(true)
    } else {
      playingProgress(paused ? 'pause' : 'unpause')
    }
  }, [paused])

  useInterval(() => {
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
      query.invalidateQueries({ queryKey: ['useritem', item.Id] })
      query.invalidateQueries({ queryKey: ['useritems', item.ParentId] })
      if (item.SeasonId)
        query.invalidateQueries({ queryKey: ['episodes', item.SeasonId] })
    })
  }

  const sendMessage = (payload: any) => {
    webviewRef.current?.injectJavaScript(
      `(function() {
        document.dispatchEvent(new MessageEvent('message', {
          data: ${JSON.stringify(payload)}
        }));
      })();`,
    )
  }
  const onMessage = (payload: WebViewMessageEvent) => {
    let data: any
    try {
      data = JSON.parse(payload.nativeEvent.data)
    } catch (e) {}

    if (data) {
      if (data.event === 'console') {
        console.info(`[Console] ${JSON.stringify(data.data)}`)
      } else if (data.event === 'ready') {
        setWebviewReady(true)
      } else if (data.event === 'progress') {
        setFontProgress(data.progress)
      } else if (data.event === 'subsready') {
        setFontsReady(true)
      } else {
        console.log(data)
      }
    }
  }

  return (
    <View style={{ backgroundColor: '#000', width: '100%', height: '100%' }}>
      <Pressable style={{ width: 0, height: 0 }} hasTVPreferredFocus={true} />

      {!!source && (
        <Video
          ref={videoRef}
          source={{
            uri: source,
            metadata: {
              title: item.Name,
              subtitle:
                'SeriesName' in item
                  ? item.SeriesName +
                    ' ' +
                    (item.ParentIndexNumber === 0
                      ? 'Special'
                      : 'S' + item.ParentIndexNumber + ':E' + item.IndexNumber)
                  : null,
              artist: 'Artists' in item ? item.Artists.join(', ') : null,
              imageUri: client.server + '/Items/' + item.Id + '/Images/Primary',
            },
            bufferConfig: { minBufferMs: 5000 },
            startPosition: !!startFrom ? ticksToSecs(startFrom) * 1000 : 0,
          }}
          viewType={ViewType.SURFACE}
          focusable={false}
          paused={
            (useLibass && !webviewReady) || (useLibass && !fontsReady)
              ? true
              : seeking
                ? true
                : paused
          }
          resizeMode="contain"
          showNotificationControls={true}
          subtitleStyle={{
            subtitlesFollowVideo: subtitleCodec === 'pgs' ? false : true,
          }}
          selectedVideoTrack={{
            type: SelectedVideoTrackType.INDEX,
            value: playMethod !== 'DirectPlay' ? '0' : videoStream.toString(),
          }}
          selectedAudioTrack={{
            type: SelectedTrackType.INDEX,
            value: playMethod !== 'DirectPlay' ? '0' : audioStream.toString(),
          }}
          selectedTextTrack={{
            type: SelectedTrackType.INDEX,
            value: subtitleCodec
              ? subtitleCodec === 'srt'
                ? settings.burninSRT
                  ? '-1'
                  : subtitleStream.toString()
                : subtitleCodec === 'pgs'
                  ? settings.burninPGS
                    ? '-1'
                    : subtitleStream.toString()
                  : '-1' // ASS
              : '-1',
          }}
          onBuffer={(e) => {
            setBuffering(e.isBuffering)
            if (useLibass) {
              sendMessage({
                event: e.isBuffering ? 'pause' : 'play',
                time: currentTime,
              })
            }
          }}
          onProgress={(e) => {
            if (!seeking) {
              setCurrentTime(e.currentTime)
              setBufferTime(e.playableDuration)
              if (!!introSegments && introSegments.Introduction?.Valid) {
                if (
                  e.currentTime > introSegments.Introduction.ShowSkipPromptAt &&
                  e.currentTime <
                    introSegments.Introduction.ShowSkipPromptAt +
                      settings.introSkipperPrompt &&
                  !introVisibility &&
                  !controlsVisibility
                ) {
                  setIntroVisibility(true)
                } else if (
                  (e.currentTime <
                    introSegments.Introduction.ShowSkipPromptAt &&
                    introVisibility) ||
                  (e.currentTime >
                    introSegments.Introduction.ShowSkipPromptAt +
                      settings.introSkipperPrompt &&
                    introVisibility)
                ) {
                  setIntroVisibility(false)
                }
              }
              if (!!introSegments && introSegments.Credits?.Valid) {
                if (
                  e.currentTime > introSegments.Credits.ShowSkipPromptAt &&
                  e.currentTime <
                    introSegments.Credits.ShowSkipPromptAt +
                      settings.introSkipperPrompt &&
                  !creditVisibility &&
                  !controlsVisibility
                ) {
                  setCreditVisibility(true)
                } else if (
                  (e.currentTime < introSegments.Credits.ShowSkipPromptAt &&
                    creditVisibility) ||
                  (e.currentTime >
                    introSegments.Credits.ShowSkipPromptAt +
                      settings.introSkipperPrompt &&
                    creditVisibility)
                ) {
                  setCreditVisibility(false)
                }
              }
            }
          }}
          onSeek={(e) => {
            setCurrentTime(e.currentTime)
            playingProgress('timeupdate', e.currentTime)
            if (useLibass) {
              sendMessage({
                event: paused ? 'pause' : 'play',
                time: e.currentTime,
              })
            }
          }}
          onPlaybackStateChanged={(e) => {
            if (useLibass) {
              sendMessage({
                event: e.isPlaying ? 'play' : 'pause',
                time: currentTime,
              })
            }
          }}
          onLoad={(e) => {
            setDuration(e.duration)
            playingProgress(undefined, e.currentTime)
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
            if (e.videoTracks.length > 0) {
              setCurrentVideoCodec(formatPlayerCodec(e.videoTracks[0].codecs))
              setCurrentVideoResolution(
                getVideoSize(e.videoTracks[0].width, e.videoTracks[0].height),
              )
            }
          }}
          onAudioTracks={(e) => {
            setCurrentAudioCodec(formatPlayerCodec(e.audioTracks[0].type))
          }}
          onEnd={() => {
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

      {useLibass && (
        <View
          style={{
            flex: 1,
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
        >
          <WebView
            ref={webviewRef}
            onMessage={onMessage}
            originWhitelist={['*']}
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
            mixedContentMode="always"
            source={{
              // uri: 'file:///android_asset/libass/index.html',
              uri: 'http://192.168.8.145:8080/index.html',
            }}
            style={{ flex: 1, backgroundColor: 'transparent' }}
            overScrollMode="never"
            setBuiltInZoomControls={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            cacheEnabled={false}
            cacheMode="LOAD_NO_CACHE"
          />
        </View>
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
                icon={paused ? 'play_arrow' : 'pause'}
                filled
                focus={playPauseButton}
              />
              <PlayerButton icon="info" filled focus={infoButton} />
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

      {(introVisibility || creditVisibility) && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={{
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
            {introLabel}
          </Text>
        </Animated.View>
      )}

      <View style={{ position: 'absolute', top: 16, left: 64 }}>
        {showSessionInfo && !!sessionInfo && (
          <SessionInfo sessionInfo={sessionInfo} playMethod={playMethod} />
        )}
      </View>

      {(buffering || (useLibass && !fontsReady)) && <CenterLoading />}

      {useLibass && !fontsReady && fontProgress && (
        <View
          style={{
            position: 'absolute',
            flex: 1,
            justifyContent: 'center',
            alignContent: 'center',
            width: '100%',
            height: '100%',
            top: 64,
          }}
        >
          <Text style={{ textAlign: 'center' }} fontWeight={500}>
            {fontProgress}
          </Text>
        </View>
      )}
    </View>
  )
}

export default Player
