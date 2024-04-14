import DeviceProfile from 'jellyfin-api/lib/types/queries/DeviceProfile'

const deviceProfile = () => {
  const base: DeviceProfile = {
    DirectPlayProfiles: [
      {
        Container: 'webm',
        Type: 'Video',
        VideoCodec: 'vp8,vp9',
        AudioCodec: 'vorbis,opus',
      },
      {
        Container: 'mp4,m4v,mov',
        Type: 'Video',
        VideoCodec: 'h264,hevc',
        AudioCodec: 'aac,mp3,opus,flac,vorbis',
      },
      {
        Container: 'mkv',
        Type: 'Video',
        VideoCodec: 'h264,hevc,vp8,vp9',
        AudioCodec: 'aac,mp3,opus,flac,vorbis,pcm_s24le,ac3,eac3,dts,truehd',
      },
      {
        Container: 'ts',
        Type: 'Video',
        VideoCodec: 'h264,hevc,vp8,vp9',
        AudioCodec: 'aac,mp3,opus,flac,vorbis,pcm_s24le,ac3,eac3,dts,truehd',
      },
    ],
    TranscodingProfiles: [
      {
        Container: 'ts',
        Type: 'Video',
        AudioCodec: 'aac',
        VideoCodec: 'hevc,h264',
        Context: 'Streaming',
        Protocol: 'hls',
        MaxAudioChannels: '8',
        MinSegments: 2,
        BreakOnNonKeyFrames: true,
      },
    ],
    CodecProfiles: [
      {
        Type: 'Video',
        Codec: 'hevc',
        Conditions: [
          {
            Condition: 'EqualsAny',
            Property: 'VideoRangeType',
            Value: 'SDR|HDR10|HLG|DV',
            IsRequired: false,
          },
        ],
      },
      {
        Type: 'Video',
        Codec: 'vp9',
        Conditions: [
          {
            Condition: 'EqualsAny',
            Property: 'VideoRangeType',
            Value: 'SDR|HDR10|HLG|DV',
            IsRequired: false,
          },
        ],
      },
    ],
    SubtitleProfiles: [
      { Format: 'vtt', Method: 'Embed' },
      { Format: 'srt', Method: 'Embed' },
      { Format: 'subrip', Method: 'Embed' },
      { Format: 'pgs', Method: 'Embed' },
      { Format: 'pgssub', Method: 'Embed' },
      { Format: 'dvdsub', Method: 'Embed' },
      { Format: 'ass', Method: 'Encode' },
      { Format: 'ssa', Method: 'Encode' },
    ],
  }
  return base
}

export default deviceProfile
