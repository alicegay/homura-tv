const formats = {
  avc1: 'H264',
  hvc1: 'HEVC',
  'audio/mp4a-latm': 'AAC',
  'audio/opus': 'OPUS',
}

const formatPlayerCodec = (codec: string) => {
  const c = codec.split('.')[0]
  if (c in formats) return formats[c]
  return c.toUpperCase()
}

export default formatPlayerCodec
