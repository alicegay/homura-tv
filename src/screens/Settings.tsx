import { useEffect, useRef } from 'react'
import { Linking, ToastAndroid, View } from 'react-native'
import useSettings from 'hooks/useSettings'
import useTheme from 'hooks/useTheme'
import { FlashList } from '@shopify/flash-list'
import ListButton from 'components/ListButton'
import Text from 'components/Text'
import Switch from 'components/Switch'
import { clearCache } from '@candlefinance/faster-image'
import deviceProfile from 'lib/deviceProfile'

const Settings = () => {
  const settings = useSettings()
  const theme = useTheme()

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
      title: 'Burn in SRT/VTT subtitles',
      subtitle: 'Transcode video with SRT/VTT subtitles burnt in',
      icon: 'subtitles',
      filled: true,
      onPress: () => {
        settings.setBurninSRT(!settings.burninSRT)
      },
      right: () => <Switch state={settings.burninSRT} />,
    },
    {
      title: 'Burn in SSA/ASS subtitles',
      subtitle: 'Transcode video with SSA/ASS subtitles burnt in',
      icon: 'subtitles',
      filled: true,
      onPress: () => {
        settings.setBurninASS(!settings.burninASS)
      },
      right: () => <Switch state={settings.burninASS} />,
    },
    {
      title: 'Burn in PGS/DVDSUB subtitles',
      subtitle: 'Transcode video with picture subtitles burnt in',
      icon: 'subtitles',
      filled: true,
      onPress: () => {
        settings.setBurninPGS(!settings.burninPGS)
      },
      right: () => <Switch state={settings.burninPGS} />,
    },
    {
      title: 'Caption Settings',
      subtitle: 'Only applies to SRT and VTT subtitles',
      icon: 'subtitles',
      onPress: () => {
        Linking.sendIntent('android.settings.CAPTIONING_SETTINGS')
      },
    },
    {
      title: 'Other',
      separator: true,
    },
    {
      title: 'Clear Image Cache',
      icon: 'clear_all',
      onPress: async () => {
        await clearCache()
        ToastAndroid.show('Cleared Image Cache', ToastAndroid.SHORT)
      },
    },
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

  const listRef = useRef<FlashList<any>>()

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
      <FlashList
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
        estimatedItemSize={88}
        showsVerticalScrollIndicator={false}
      />
      <Text
        style={{
          fontSize: 28,
          paddingTop: 12,
          paddingHorizontal: 32,
          position: 'absolute',
        }}
        fontWeight={700}
      >
        Settings
      </Text>
    </View>
  )
}

export default Settings
