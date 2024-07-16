import { Linking, ToastAndroid, View } from 'react-native'
import useSettings from 'hooks/useSettings'
import useTheme from 'hooks/useTheme'
import { FlashList } from '@shopify/flash-list'
import ListButton from 'components/ListButton'
import Text from 'components/Text'
import Switch from 'components/Switch'
import { useRef } from 'react'
import { clearCache } from '@candlefinance/faster-image'

const Settings = () => {
  const settings = useSettings()
  const theme = useTheme()

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
