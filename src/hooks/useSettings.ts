import AsyncStorage from '@react-native-async-storage/async-storage'
import DeviceProfile from 'jellyfin-api/lib/types/queries/DeviceProfile'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SettingsStore {
  playback: {
    forceStereo: boolean
    introSkipper: boolean

    setForceStereo: (value: boolean) => void
    setIntroSkipper: (value: boolean) => void
  }

  deviceProfile: DeviceProfile | null
  setDeviceProfile: (profile: DeviceProfile) => void
}

const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      playback: {
        forceStereo: false,
        introSkipper: true,

        setForceStereo: (value) =>
          set((state) => ({
            playback: { ...state.playback, forceStereo: value },
          })),
        setIntroSkipper: (value) =>
          set((state) => ({
            playback: { ...state.playback, introSkipper: value },
          })),
      },

      deviceProfile: null,
      setDeviceProfile: (profile) => set(() => ({ deviceProfile: profile })),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

export default useSettings
