import { NativeModules } from 'react-native'

const supportsCodec = async (mime: string) => {
  const { CodecModule } = NativeModules
  const support: Boolean = await CodecModule.supportsCodec(mime)
  return support
}

const getMaxChannelCount = async (mime: string) => {
  const { CodecModule } = NativeModules
  const channelCount: number = await CodecModule.getMaxChannelCount(mime)
  return channelCount
}

type HDRSupport = 'INVALID' | 'DV' | 'HDR10' | 'HDR10+' | 'HLG'[]
const getHDRSupport = async (): Promise<HDRSupport> => {
  const { CodecModule } = NativeModules
  const types = {
    '-1': 'INVALID',
    1: 'DV',
    2: 'HDR10',
    4: 'HDR10+',
    3: 'HLG',
  }
  const supportString: string = await CodecModule.getHDRSupport()
  const support: number[] = JSON.parse(supportString)
  return support.map((t: number) => types[t])
}

const getDirectAudioSupport = async () => {
  const { CodecModule } = NativeModules
  const codecs = await CodecModule.getAudioSupport()
  return JSON.parse(codecs)
}

const codecSupport = async () => {
  const { CodecModule } = NativeModules

  console.log('--- CODECS ---')
  CodecModule.supportsAV1().then((r) => console.log('AV1 ' + r))
  CodecModule.supportsAV1Main10().then((r) => console.log('AV1Main10 ' + r))
  CodecModule.supportsHevc().then((r) => console.log('HEVC ' + r))
  CodecModule.supportsHevcMain10().then((r) => console.log('HEVCMain10 ' + r))
  CodecModule.getHevcMainLevel().then((r) =>
    console.log('HEVC Main Level ' + r),
  )
  CodecModule.getHevcMain10Level().then((r) =>
    console.log('HEVC Main10 Level ' + r),
  )
  CodecModule.supportsAVCHigh10().then((r) => console.log('AVCHigh10 ' + r))
  supportsCodec('video/x-vnd.on2.vp8').then((r) => console.log('VP8 ' + r))
  supportsCodec('video/x-vnd.on2.vp9').then((r) => console.log('VP9 ' + r))
  supportsCodec('video/dolby-vision').then((r) => console.log('DV ' + r))
  supportsCodec('video/mpeg2').then((r) => console.log('MPEG2 ' + r))
  supportsCodec('video/mp4v-es').then((r) => console.log('MPEG4 ' + r))

  // supportsCodec('audio/mp4a-latm').then((r) => console.log('AAC ' + r))
  // supportsCodec('audio/ac3').then((r) => console.log('AC3 ' + r))
  // supportsCodec('audio/eac3').then((r) => console.log('EAC3 ' + r))
  // supportsCodec('audio/vnd.dolby.mlp').then((r) => console.log('TRUEHD ' + r))
  // supportsCodec('audio/vnd.dts').then((r) => console.log('DTS ' + r))
  // supportsCodec('audio/vnd.dts.hd').then((r) => console.log('DTS HD ' + r))
  // supportsCodec('audio/vnd.dts.uhd').then((r) => console.log('DTS UHD ' + r))
  // supportsCodec('audio/flac').then((r) => console.log('FLAC ' + r))
  // supportsCodec('audio/opus').then((r) => console.log('OPUS ' + r))
  // supportsCodec('audio/vorbis').then((r) => console.log('VORBIS ' + r))
  // supportsCodec('audio/mpeg').then((r) => console.log('MP3 ' + r))

  getMaxChannelCount('audio/mp4a-latm').then((c) =>
    console.log('Audio Channels: ' + c),
  )
  getHDRSupport().then((t) => {
    console.log('HDR Support: ' + t)
  })

  getDirectAudioSupport().then((c) => console.log('Direct Audio: ' + c))
}

export default codecSupport
