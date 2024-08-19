import AsyncStorage from '@react-native-async-storage/async-storage'
import DeviceProfile from 'jellyfin-api/lib/types/queries/DeviceProfile'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SettingsStore {
  forceStereo: boolean
  introSkipper: boolean
  classification: 'au' | 'jp' | 'uk' | 'us'
  nativeAss: boolean

  setForceStereo: (value: boolean) => void
  setIntroSkipper: (value: boolean) => void
  setNativeAss: (value: boolean) => void

  deviceProfile: DeviceProfile | null
  setDeviceProfile: (profile: DeviceProfile) => void
}

const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      forceStereo: false,
      introSkipper: true,
      classification: 'au',
      nativeAss: false,

      setForceStereo: (value) => set(() => ({ forceStereo: value })),
      setIntroSkipper: (value) => set(() => ({ introSkipper: value })),
      setNativeAss: (value) => set(() => ({ nativeAss: value })),

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
