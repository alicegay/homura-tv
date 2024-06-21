import MediaStream from 'jellyfin-api/lib/types/media/MediaStream'
import formatStream, { formattedStream } from './formatStream'

export interface sortedStreams {
  videos: formattedStream[]
  audios: formattedStream[]
  subtitles: formattedStream[]
  defaults: {
    video: number
    audio: number
    subtitle: number
  }
}

const sortStreams = (streams: MediaStream[]): sortedStreams => {
  let videos = []
  let audios = []
  let subtitles = []

  let v = 0
  let a = 0
  let s = 0
  let dV = -1
  let dA = 0
  let dS = 0
  for (let i = 0; i < streams.length; i++) {
    if (streams[i].Type === 'Video') {
      videos.push({ ...formatStream(streams[i]), index: v })
      if (streams[i].IsDefault === true) dV = v
      v++
    } else if (streams[i].Type === 'Audio') {
      audios.push({ ...formatStream(streams[i]), index: a })
      if (streams[i].IsDefault === true) dA = a
      a++
    } else if (streams[i].Type === 'Subtitle') {
      subtitles.push({ ...formatStream(streams[i]), index: s })
      if (streams[i].IsDefault === true) dS = s
      s++
    }
  }

  return {
    videos,
    audios,
    subtitles,
    defaults: {
      video: dV,
      audio: dA,
      subtitle: dS,
    },
  }
}

export default sortStreams
