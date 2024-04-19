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

  @ReactMethod fun supportsHevc(promise: Promise) {
    promise.resolve(
      hasCodecForMime(MediaFormat.MIMETYPE_VIDEO_HEVC)
    )
  }

  @ReactMethod fun supportsHevcMain10(promise: Promise) {
    promise.resolve(
      hasDecoder(
        MediaFormat.MIMETYPE_VIDEO_HEVC,
        CodecProfileLevel.HEVCProfileMain10,
        CodecProfileLevel.HEVCMainTierLevel4
      )
    )
  }

  @ReactMethod fun getHevcMainLevel(promise: Promise) {
    promise.resolve(
      getHevcLevelString(
        CodecProfileLevel.HEVCProfileMain
      )
    )
  }

  @ReactMethod fun getHevcMain10Level(promise: Promise) {
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

  @ReactMethod fun getAudioSupport(promise: Promise) {
    //val audioManager = currentActivity?.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    val codecs: ArrayList<String> = ArrayList()
    val attr = AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_MOVIE).build()
    val ac3 = AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_AC3).setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_OUT_STEREO).build()
    val eac3 = AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_E_AC3).setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_OUT_STEREO).build()
    val dmat = AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_DOLBY_MAT).setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_OUT_STEREO).build()
    val truehd = AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_DOLBY_TRUEHD).setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_OUT_STEREO).build()
    val dts = AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_DTS).setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_OUT_STEREO).build()
    val dtshd = AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_DTS_HD).setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_OUT_STEREO).build()
    val pcm8 = AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_8BIT).setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_OUT_STEREO).build()
    val pcmf = AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_FLOAT).setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_OUT_STEREO).build()
    if (AudioTrack.isDirectPlaybackSupported(ac3, attr)) { codecs.add("AC3") }
    if (AudioTrack.isDirectPlaybackSupported(eac3, attr)) { codecs.add("EAC3") }
    if (AudioTrack.isDirectPlaybackSupported(dmat, attr)) { codecs.add("DMAT") }
    if (AudioTrack.isDirectPlaybackSupported(truehd, attr)) { codecs.add("TRUEHD") }
    if (AudioTrack.isDirectPlaybackSupported(dts, attr)) { codecs.add("DTS") }
    if (AudioTrack.isDirectPlaybackSupported(dtshd, attr)) { codecs.add("DTSHD") }
    if (AudioTrack.isDirectPlaybackSupported(pcm8, attr)) { codecs.add("PCM8") }
    if (AudioTrack.isDirectPlaybackSupported(pcmf, attr)) { codecs.add("PCMF") }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      val dtshdma = AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_DTS_HD_MA).setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_OUT_STEREO).build()
      val dtsx = AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_DTS_UHD_P1).setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_OUT_STEREO).build()
      if (AudioTrack.isDirectPlaybackSupported(dtshdma, attr)) { codecs.add("DTSMA") }
      if (AudioTrack.isDirectPlaybackSupported(dtsx, attr)) { codecs.add("DTSX") }
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val pcm24 = AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_24BIT_PACKED).setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_OUT_STEREO).build()
      val pcm32 = AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_32BIT).setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_OUT_STEREO).build()
      if (AudioTrack.isDirectPlaybackSupported(pcm24, attr)) { codecs.add("PCM24LE") }
      if (AudioTrack.isDirectPlaybackSupported(pcm32, attr)) { codecs.add("PCM32") }
    }
    promise.resolve(codecs.joinToString("\",\"", "[\"", "\"]"))
  }
}
