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
  let dA = -1
  let dS = -1
  for (let i = 0; i < streams.length; i++) {
    if (streams[i].Type === 'Video') {
      videos.push({ ...formatStream(streams[i]), index: v })
      if (streams[i].IsDefault && dV === -1) dV = v
      v++
    } else if (streams[i].Type === 'Audio') {
      audios.push({ ...formatStream(streams[i]), index: a })
      if (streams[i].IsDefault && dA === -1) dA = a
      a++
    } else if (streams[i].Type === 'Subtitle') {
      subtitles.push({ ...formatStream(streams[i]), index: s })
      if (streams[i].IsDefault && dS === -1) dS = s
      s++
    }

    if (dV === -1) dV = 0
    if (dA === -1) dA = 0
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
