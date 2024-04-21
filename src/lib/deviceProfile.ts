import DeviceProfile from 'jellyfin-api/lib/types/queries/DeviceProfile'
import {
  AudioSupport,
  getDirectAudioSupport,
  getHDRSupport,
  getHEVCMain10Level,
  getHEVCMainLevel,
  supportsAV1Main10,
  supportsAVCHigh10,
  supportsCodec,
  supportsHEVCMain10,
} from './codecSupport'

const addCodecs = (codecs: string[], join: string = ',') => {
  return codecs.filter((codec) => !!codec).join(join)
}

const add = (codec: string, b: Boolean) => {
  if (b) return codec
}

const addAudio = async (
  codec: string,
  local: Boolean,
  direct: AudioSupport,
  directAudioList: AudioSupport[],
) => {
  if (local || directAudioList.includes(direct)) return codec
}

const deviceProfile = async (): Promise<DeviceProfile> => {
  let profile: DeviceProfile = {
    DirectPlayProfiles: [],
    TranscodingProfiles: [],
    CodecProfiles: [],
    SubtitleProfiles: [],
  }

  const directAudio = await getDirectAudioSupport()
  const support = {
    h264: await supportsCodec('video/avc'),
    h264_10: await supportsAVCHigh10(),
    hevc: await supportsCodec('video/hevc'),
    hevc_10: await supportsHEVCMain10(),
    hevc_level: await getHEVCMainLevel(),
    hevc_10level: await getHEVCMain10Level(),
    vp8: await supportsCodec('video/x-vnd.on2.vp8'),
    vp9: await supportsCodec('video/x-vnd.on2.vp9'),
    av1: await supportsCodec('video/av01'),
    av1_10: await supportsAV1Main10(),

    aac: await supportsCodec('audio/mp4a-latm'),
    flac: await supportsCodec('audio/flac'),
    mp3: await supportsCodec('audio/mpeg'),
    vorbis: await supportsCodec('audio/vorbis'),
    opus: await supportsCodec('audio/opus'),

    ac3: await supportsCodec('audio/ac3'),
    eac3: await supportsCodec('audio/eac3'),
    truehd: await supportsCodec('audio/vnd.dolby.mlp'),
    dts: await supportsCodec('audio/vnd.dts'),
    dtshd: await supportsCodec('audio/vnd.dts.hd'),
    dtsx: await supportsCodec('audio/vnd.dts.uhd'),
    pcm: await supportsCodec('audio/raw'),
  }

  profile.DirectPlayProfiles.push({
    Container: 'webm',
    Type: 'Video',
    VideoCodec: addCodecs([
      add('vp8', support.vp8),
      add('vp9', support.vp9),
      add('av1', support.av1),
    ]),
    AudioCodec: addCodecs([
      add('vorbis', support.vorbis),
      add('opus', support.opus),
    ]),
  })

  profile.DirectPlayProfiles.push({
    Container: 'mp4,m4v,mov,mkv,ts',
    Type: 'Video',
    VideoCodec: addCodecs([
      add('h264', support.h264),
      add('hevc', support.hevc),
      add('vp8', support.vp8),
      add('vp9', support.vp9),
      add('av1', support.av1),
    ]),
    AudioCodec: addCodecs([
      add('aac', support.aac),
      add('flac', support.flac),
      add('mp3', support.mp3),
      add('vorbis', support.vorbis),
      add('opus', support.opus),
      await addAudio('ac3', support.ac3, 'AC3', directAudio),
      await addAudio('eac3', support.eac3, 'EAC3', directAudio),
      await addAudio('truehd', support.truehd, 'TRUEHD', directAudio),
      await addAudio('dts', support.dts, 'DTS', directAudio),
      await addAudio('dts_hd', support.dtshd, 'DTSHD', directAudio),
      await addAudio('dts_x', support.dtshd, 'DTSX', directAudio),
      await addAudio('pcm_s24le', support.pcm, 'PCM24LE', directAudio),
    ]),
  })

  profile.TranscodingProfiles.push({
    Container: 'ts',
    Type: 'Video',
    Context: 'Streaming',
    Protocol: 'hls',
    MaxAudioChannels: '8',
    MinSegments: 2,
    BreakOnNonKeyFrames: true,
    VideoCodec: addCodecs([
      add('hevc', support.hevc),
      add('h264', support.h264),
    ]),
    AudioCodec: addCodecs([
      add('aac', support.aac),
      add('flac', support.flac),
      add('mp3', support.mp3),
      add('vorbis', support.vorbis),
      add('opus', support.opus),
      await addAudio('ac3', support.ac3, 'AC3', directAudio),
      await addAudio('eac3', support.eac3, 'EAC3', directAudio),
      await addAudio('truehd', support.truehd, 'TRUEHD', directAudio),
      await addAudio('dts', support.dts, 'DTS', directAudio),
      await addAudio('dts_hd', support.dtshd, 'DTSHD', directAudio),
      await addAudio('dts_x', support.dtshd, 'DTSX', directAudio),
      await addAudio('pcm_s24le', support.pcm, 'PCM24LE', directAudio),
    ]),
  })

  const hdrSupport = await getHDRSupport()

  profile.CodecProfiles.push({
    Type: 'Video',
    Codec: 'h264',
    Conditions: [
      {
        Condition: 'EqualsAny',
        Property: 'VideoProfile',
        IsRequired: true,
        Value: addCodecs(
          [
            'main',
            'high',
            'baseline',
            'constrained baseline',
            support.h264_10 && 'high 10',
          ],
          '|',
        ),
      },
    ],
  })

  if (support.hevc) {
    profile.CodecProfiles.push({
      Type: 'Video',
      Codec: 'hevc',
      Conditions: [
        {
          Condition: 'EqualsAny',
          Property: 'VideoProfile',
          IsRequired: true,
          Value: addCodecs(['main', support.hevc_10 && 'main 10'], '|'),
        },
        {
          Condition: 'LessThanEqual',
          Property: 'VideoLevel',
          IsRequired: true,
          Value: support.hevc_10
            ? Math.min(support.hevc_10level, support.hevc_level).toString()
            : support.hevc_level.toString(),
        },
        {
          Condition: 'EqualsAny',
          Property: 'VideoRangeType',
          IsRequired: true,
          Value: addCodecs(
            [
              'SDR',
              hdrSupport.includes('HDR10') && 'HDR10',
              hdrSupport.includes('HLG') && 'HLG',
            ],
            '|',
          ),
        },
      ],
    })
  }

  if (support.vp9) {
    profile.CodecProfiles.push({
      Type: 'Video',
      Codec: 'vp9',
      Conditions: [
        {
          Condition: 'EqualsAny',
          Property: 'VideoRangeType',
          IsRequired: true,
          Value: addCodecs(
            [
              'SDR',
              hdrSupport.includes('HDR10') && 'HDR10',
              hdrSupport.includes('HLG') && 'HLG',
            ],
            '|',
          ),
        },
      ],
    })
  }

  if (support.av1) {
    profile.CodecProfiles.push({
      Type: 'Video',
      Codec: 'av1',
      Conditions: [
        {
          Condition: 'EqualsAny',
          Property: 'VideoRangeType',
          IsRequired: true,
          Value: addCodecs(
            [
              'SDR',
              hdrSupport.includes('HDR10') && 'HDR10',
              hdrSupport.includes('HLG') && 'HLG',
            ],
            '|',
          ),
        },
      ],
    })
  }

  profile.SubtitleProfiles.push(
    { Format: 'vtt', Method: 'Embed' },
    { Format: 'srt', Method: 'Embed' },
    { Format: 'subrip', Method: 'Embed' },
    { Format: 'pgs', Method: 'Embed' },
    { Format: 'pgssub', Method: 'Embed' },
    { Format: 'dvdsub', Method: 'Embed' },
    { Format: 'ass', Method: 'Encode' },
    { Format: 'ssa', Method: 'Encode' },
  )

  //console.log(JSON.stringify(profile))
  console.log('Set Device Profile')
  return profile
}

export default deviceProfile
