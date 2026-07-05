import { useEffect, useRef } from 'react'
import {
  FlatList,
  Linking,
  ToastAndroid,
  useWindowDimensions,
  View,
} from 'react-native'
import useSettings from 'hooks/useSettings'
import useTheme from 'hooks/useTheme'
import ListButton from 'components/ListButton'
import Text from 'components/Text'
import Switch from 'components/Switch'
import { clearCache } from '@candlefinance/faster-image'
import deviceProfile from 'lib/deviceProfile'
import BlurView from '@sbaiahmed1/react-native-blur'

const Settings = () => {
  const settings = useSettings()
  const theme = useTheme()
  const { width } = useWindowDimensions()

  const setDeviceProfile = async () => {
    const profile = await deviceProfile()
    settings.setDeviceProfile(profile)
  }
  useEffect(() => {
    setDeviceProfile()
  }, [settings.nativeAss])

  const data = [
    {
      title: 'Playback',
      separator: true,
    },
    {
      title: 'Force Stereo',
      subtitle: 'Transcode surround sound into stereo',
      icon: 'volume_up',
      filled: true,
      onPress: () => {
        settings.setForceStereo(!settings.forceStereo)
      },
      right: () => <Switch state={settings.forceStereo} />,
      default: true,
    },
    {
      title: 'Use Intro Skipper',
      subtitle: 'Show skip button during opening and ending sequences',
      icon: 'skip_next',
      filled: true,
      onPress: () => {
        settings.setIntroSkipper(!settings.introSkipper)
      },
      right: () => <Switch state={settings.introSkipper} />,
    },
    {
      title: 'Prefer Fallback Player',
      subtitle:
        'Use ExoPlayer instead of MPV. This is always used for HDR and BT2020 content',
      icon: 'tv',
      onPress: () => {
        settings.setPreferFallback(!settings.preferFallback)
      },
      right: () => <Switch state={settings.preferFallback} />,
    },
    {
      title: 'Subtitles',
      separator: true,
    },
    {
      title: 'Native SSA/ASS',
      subtitle:
        'Render SSA/AAS subtitles natively which can prevent transcoding',
      icon: 'subtitles',
      filled: true,
      onPress: () => {
        settings.setNativeAss(!settings.nativeAss)
      },
      right: () => <Switch state={settings.nativeAss} />,
    },
    {
      title: 'Caption Settings (Fallback Player)',
      subtitle: 'Style settings for subtitles when using the fallback player',
      icon: 'closed_caption',
      filled: true,
      onPress: () => {
        Linking.sendIntent('android.settings.CAPTIONING_SETTINGS')
      },
    },
    {
      title: 'Other',
      separator: true,
    },
    {
      title: 'Reduce Effects',
      subtitle: 'Reduces some effects to improve performance',
      icon: 'accessibility',
      onPress: () => {
        settings.setReduceEffects(!settings.reduceEffects)
      },
      right: () => <Switch state={settings.reduceEffects} />,
    },
    // {
    //   title: 'Clear Image Cache',
    //   icon: 'clear_all',
    //   onPress: async () => {
    //     await clearCache()
    //     ToastAndroid.show('Cleared Image Cache', ToastAndroid.SHORT)
    //   },
    // },
    {
      title: 'User',
      separator: true,
    },
    {
      title: 'Sign out',
      icon: 'logout',
      onPress: () => {},
    },
  ]

  const listRef = useRef<FlatList<any>>(null)

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: 56,
        paddingHorizontal: 96,
        paddingBottom: 16,
      }}
    >
      <FlatList
        ref={listRef}
        data={data}
        renderItem={({ item, index }) =>
          item.separator ? (
            <Text
              style={{
                fontSize: 16,
                paddingTop: 16,
                paddingHorizontal: 24,
                paddingBottom: 4,
              }}
              fontWeight={700}
            >
              {item.title}
            </Text>
          ) : (
            <ListButton
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              filled={item.filled}
              transparent
              onPress={item.onPress}
              right={item.right}
              onFocus={() => {
                listRef.current.scrollToIndex({
                  index: index,
                  viewPosition: 0.5,
                  animated: true,
                })
              }}
              hasTVPreferredFocus={item.default ? true : false}
            />
          )
        }
        showsVerticalScrollIndicator={false}
      />
      <BlurView
        blurType="dark"
        style={{
          width: width,
          paddingVertical: 12,
          paddingHorizontal: 32,
          position: 'absolute',
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 28 }} fontWeight={700}>
          Settings
        </Text>
      </BlurView>
    </View>
  )
}

export default Settings
