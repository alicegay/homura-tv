package dev.ritsu.homura.tv

import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

import android.media.AudioFormat
import android.media.AudioAttributes
import android.media.AudioTrack
import android.media.MediaCodecInfo.CodecProfileLevel
import android.media.MediaCodecList
import android.media.MediaFormat
import android.os.Build

// https://github.com/jellyfin/jellyfin-androidtv/blob/master/app/src/main/java/org/jellyfin/androidtv/util/profile/MediaCodecCapabilitiesTest.kt

class CodecModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "CodecModule"

  private val mediaCodecList by lazy { MediaCodecList(MediaCodecList.REGULAR_CODECS) }

  // HEVC levels as reported by ffprobe are multiplied by 30, e.g. level 4.1 is 123
  private val hevcLevelStrings = listOf(
    CodecProfileLevel.HEVCMainTierLevel1 to "30",
    CodecProfileLevel.HEVCMainTierLevel2 to "60",
    CodecProfileLevel.HEVCMainTierLevel21 to "63",
    CodecProfileLevel.HEVCMainTierLevel3 to "90",
    CodecProfileLevel.HEVCMainTierLevel31 to "93",
    CodecProfileLevel.HEVCMainTierLevel4 to "120",
    CodecProfileLevel.HEVCMainTierLevel41 to "123",
    CodecProfileLevel.HEVCMainTierLevel5 to "150",
    CodecProfileLevel.HEVCMainTierLevel51 to "153",
    CodecProfileLevel.HEVCMainTierLevel52 to "156",
    CodecProfileLevel.HEVCMainTierLevel6 to "180",
    CodecProfileLevel.HEVCMainTierLevel61 to "183",
    CodecProfileLevel.HEVCMainTierLevel62 to "186",
  )

  private fun getHevcLevelString(profile: Int): String {
    val level = getDecoderLevel(MediaFormat.MIMETYPE_VIDEO_HEVC, profile)

    return hevcLevelStrings.asReversed().find { item: Pair<Int, String> ->
      level >= item.first
    }?.second ?: "0"
  }

  private fun getDecoderLevel(mime: String, profile: Int): Int {
    var maxLevel = 0

    for (info in mediaCodecList.codecInfos) {
      if (info.isEncoder) continue

      try {
        val capabilities = info.getCapabilitiesForType(mime)
        for (profileLevel in capabilities.profileLevels) {
          if (profileLevel.profile == profile) {
            maxLevel = maxOf(maxLevel, profileLevel.level)
          }
        }
      } catch (e: IllegalArgumentException) {
        //Log.d(e, "Decoder %s does not support %s", info.name, mime)
      }
    }

    return maxLevel
  }

  private fun hasDecoder(mime: String, profile: Int, level: Int): Boolean {
    for (info in mediaCodecList.codecInfos) {
      if (info.isEncoder) continue

      try {
        val capabilities = info.getCapabilitiesForType(mime)
        for (profileLevel in capabilities.profileLevels) {
          if (profileLevel.profile != profile) continue

          // H.263 levels are not completely ordered:
          // Level45 support only implies Level10 support
          if (mime.equals(MediaFormat.MIMETYPE_VIDEO_H263, ignoreCase = true)) {
            if (profileLevel.level != level && profileLevel.level == CodecProfileLevel.H263Level45 && level > CodecProfileLevel.H263Level10) {
              continue
            }
          }

          if (profileLevel.level >= level) return true
        }
      } catch (e: IllegalArgumentException) {
        //Log.w(e)
      }
    }

    return false
  }

  private fun hasCodecForMime(mime: String): Boolean {
    for (info in mediaCodecList.codecInfos) {
      if (info.isEncoder) continue

      if (info.supportedTypes.any { it.equals(mime, ignoreCase = true) }) {
        //Log.i("found codec %s for mime %s", info.name, mime)
        return true
      }
    }

    return false
  }

  private fun maxInputChannelCount(mime: String): Int {
    for (info in mediaCodecList.codecInfos) {
      if (info.supportedTypes.any { it.equals(mime, ignoreCase = true) }) {
        val caps = info.getCapabilitiesForType(mime)
        val audio = caps.audioCapabilities
        return audio.maxInputChannelCount
      }
    }
    return 0
  }

  @ReactMethod fun supportsAV1(promise: Promise) {
    promise.resolve(
      hasCodecForMime(MediaFormat.MIMETYPE_VIDEO_AV1)
    )
  }

  @ReactMethod fun supportsAV1Main10(promise: Promise) {
    promise.resolve(
      hasDecoder(
        MediaFormat.MIMETYPE_VIDEO_AV1,
        CodecProfileLevel.AV1ProfileMain10,
        CodecProfileLevel.AV1Level5
      )
    )
  }

  @ReactMethod fun supportsHEVC(promise: Promise) {
    promise.resolve(
      hasCodecForMime(MediaFormat.MIMETYPE_VIDEO_HEVC)
    )
  }

  @ReactMethod fun supportsHEVCMain10(promise: Promise) {
    promise.resolve(
      hasDecoder(
        MediaFormat.MIMETYPE_VIDEO_HEVC,
        CodecProfileLevel.HEVCProfileMain10,
        CodecProfileLevel.HEVCMainTierLevel4
      )
    )
  }

  @ReactMethod fun getHEVCMainLevel(promise: Promise) {
    promise.resolve(
      getHevcLevelString(
        CodecProfileLevel.HEVCProfileMain
      )
    )
  }

  @ReactMethod fun getHEVCMain10Level(promise: Promise) {
    promise.resolve(
      getHevcLevelString(
        CodecProfileLevel.HEVCProfileMain10
      )
    )
  }

  @ReactMethod fun supportsAVCHigh10(promise: Promise) {
    promise.resolve(
      hasDecoder(
        MediaFormat.MIMETYPE_VIDEO_AVC,
        CodecProfileLevel.AVCProfileHigh10,
        CodecProfileLevel.AVCLevel4
      )
    )
  }

  @ReactMethod fun supportsCodec(mime: String, promise: Promise) {
    promise.resolve(
      hasCodecForMime(mime)
    )
  }

  @ReactMethod fun getMaxChannelCount(mime: String, promise: Promise) {
    promise.resolve(
      maxInputChannelCount(mime)
    )
  }

  @ReactMethod fun getHDRSupport(promise: Promise) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      val display = currentActivity?.display?.mode
      promise.resolve(
        display?.supportedHdrTypes.contentToString()
      )
    } else {
      val display = currentActivity?.display
      promise.resolve(
          display?.hdrCapabilities?.supportedHdrTypes.contentToString()
      )
    }
  }

  // https://developer.android.com/training/tv/playback/audio-capabilities
  data class Codec(val name: String, val encoding: Int)
  @ReactMethod fun getAudioSupport(promise: Promise) {
    val codecs = ArrayList<Codec>()
    codecs.add(Codec("AC3", AudioFormat.ENCODING_AC3))
    codecs.add(Codec("EAC3", AudioFormat.ENCODING_E_AC3))
    codecs.add(Codec("DMAT", AudioFormat.ENCODING_DOLBY_MAT))
    codecs.add(Codec("TRUEHD", AudioFormat.ENCODING_DOLBY_TRUEHD))
    codecs.add(Codec("DTS", AudioFormat.ENCODING_DTS))
    codecs.add(Codec("DTSHD", AudioFormat.ENCODING_DTS_HD))
    codecs.add(Codec("PCM8", AudioFormat.ENCODING_PCM_8BIT))
    codecs.add(Codec("PCMF", AudioFormat.ENCODING_PCM_FLOAT))
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      codecs.add(Codec("DTSHDMA", AudioFormat.ENCODING_DTS_HD_MA))
      codecs.add(Codec("DTSX", AudioFormat.ENCODING_DTS_UHD_P1))
    } else {
      codecs.add(Codec("DTSX", AudioFormat.ENCODING_DTS_UHD))
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      codecs.add(Codec("PCM24LE", AudioFormat.ENCODING_PCM_24BIT_PACKED))
      codecs.add(Codec("PCM32", AudioFormat.ENCODING_PCM_32BIT))
    }

    val supportedCodecs = ArrayList<String>()
    val attr = AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_MOVIE).build()
    for (codec in codecs) {
      val audio = AudioFormat.Builder().setEncoding(codec.encoding).setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_OUT_STEREO).build()
      val audio51 = AudioFormat.Builder().setEncoding(codec.encoding).setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_OUT_5POINT1).build()
      val audio71 = AudioFormat.Builder().setEncoding(codec.encoding).setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_OUT_7POINT1_SURROUND).build()
      if (AudioTrack.isDirectPlaybackSupported(audio, attr)) { supportedCodecs.add(codec.name) }
      if (AudioTrack.isDirectPlaybackSupported(audio51, attr)) { supportedCodecs.add(codec.name + "_51") }
      if (AudioTrack.isDirectPlaybackSupported(audio71, attr)) { supportedCodecs.add(codec.name + "_71") }
    }

    promise.resolve(supportedCodecs.joinToString("\",\"", "[\"", "\"]"))
  }
}
