import MediaStream from 'jellyfin-api/lib/types/media/MediaStream'
import language from './language'

export interface formattedStream {
  id: number
  index: number
  type: 'Video' | 'Audio' | 'Subtitle'
  title: string
  name?: string
  codec: string
  codecName?: string
  resolution?: string
  framerate?: number
  layout?: string
  default: boolean
  forced: boolean
  sdh: boolean
  original: MediaStream
}

const formatStream = (stream: MediaStream): formattedStream => {
  if (stream.Type === 'Video') {
    let title = [getVideoSize(stream.Width, stream.Height, stream.IsInterlaced)]
    if (stream.VideoRange.toUpperCase() != 'SDR') title.push(stream.VideoRange)
    title.push(stream.Codec.toUpperCase())
    return {
      id: stream.Index,
      index: stream.Index,
      type: 'Video',
      title: title.join(' '),
      name: stream.Title,
      codec: stream.Codec.toUpperCase(),
      resolution: getVideoSize(
        stream.Width,
        stream.Height,
        stream.IsInterlaced,
      ),
      framerate: Math.round(stream.RealFrameRate),
      default: stream.IsDefault,
      forced: stream.IsForced,
      sdh: stream.IsHearingImpaired,
      original: stream,
    }
  } else if (stream.Type === 'Audio') {
    const title = [
      getLanguageName(stream.Language),
      getAudioFormat(stream.Codec),
    ]
    if (stream.Profile?.includes('Dolby Atmos')) title.push('+ Dolby Atmos')
    title.push(
      stream.ChannelLayout
        ? capitalize(stream.ChannelLayout)
        : getAudioLayout(stream.Channels),
    )
    return {
      id: stream.Index,
      index: stream.Index,
      type: 'Audio',
      title: title.join(' '),
      name: stream.Title,
      codec: stream.Codec.toUpperCase(),
      codecName: getAudioFormat(stream.Codec),
      layout: stream.ChannelLayout
        ? capitalize(stream.ChannelLayout)
        : getAudioLayout(stream.Channels),
      default: stream.IsDefault,
      forced: stream.IsForced,
      sdh: stream.IsHearingImpaired,
      original: stream,
    }
  } else if (stream.Type === 'Subtitle') {
    const title = [getLanguageName(stream.Language)]
    if (stream.IsForced) title.push('Forced')
    if (stream.IsHearingImpaired) title.push('SDH')
    title.push(getSubtitleFormat(stream.Codec))
    return {
      id: stream.Index,
      index: stream.Index,
      type: 'Subtitle',
      title: title.join(' '),
      name: stream.Title,
      codec: stream.Codec.toUpperCase(),
      default: stream.IsDefault,
      forced: stream.IsForced,
      sdh: stream.IsHearingImpaired,
      original: stream,
    }
  }
}

export const getVideoSize = (
  width: number,
  height: number,
  interlaced: boolean = false,
): string => {
  const i = interlaced ? 'i' : 'p'
  if (width === 7680 || height === 4320) return '8K'
  if (width === 3840 || height === 2160) return '4K'
  if (width === 2560 || height === 1440) return '1440' + i
  if (width === 1920 || height === 1080) return '1080' + i
  if (width === 1280 || height === 720) return '720' + i
  return height + i
}

const getAudioFormat = (codec: string): string => {
  const c = codec.toUpperCase()
  if (c === 'PCM_S16BE') return 'PCM'
  if (c === 'PCM_S16LE') return 'PCM'
  if (c === 'PCM_S24BE') return 'PCM'
  if (c === 'PCM_S24LE') return 'PCM'
  if (c === 'PCM_S32BE') return 'PCM'
  if (c === 'PCM_S32LE') return 'PCM'
  if (c === 'AC3') return 'Dolby Digital'
  if (c === 'EAC3') return 'Dolby Digital Plus'
  if (c === 'TRUEHD') return 'Dolby TrueHD'
  if (c === 'DTS') return 'DTS'
  return c
}

const getAudioLayout = (channels: number): string => {
  if (channels === 1) return 'Mono'
  if (channels === 2) return 'Stereo'
  if (channels === 6) return '5.1'
  if (channels === 8) return '7.1'
  return channels + ' ch'
}

const getSubtitleFormat = (codec: string): string => {
  const c = codec.toUpperCase()
  if (c === 'ASS') return 'SSA/ASS'
  if (c === 'SUBRIP') return 'SRT'
  if (c === 'PGSSUB') return 'PGS'
  return c
}

const getLanguageName = (lang: string): string => {
  if (!lang) return 'Unknown'
  if (lang.toLowerCase() in language) return language[lang.toLowerCase()][1]
  return lang.toUpperCase()
}

const capitalize = (s: string): string => {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default formatStream
