import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import DeviceProfile from 'jellyfin-api/lib/types/queries/DeviceProfile'
import { storage } from 'lib/storage'

interface SettingsStore {
  forceStereo: boolean
  introSkipper: boolean
  introSkipperPrompt: number
  classification: 'au' | 'jp' | 'uk' | 'us'
  nativeAss: boolean
  reduceEffects: boolean
  preferFallback: boolean

  setForceStereo: (value: boolean) => void
  setIntroSkipper: (value: boolean) => void
  setIntroSkipperPrompt: (value: number) => void
  setNativeAss: (value: boolean) => void
  setReduceEffects: (value: boolean) => void
  setPreferFallback: (value: boolean) => void

  deviceProfile: DeviceProfile | null
  setDeviceProfile: (profile: DeviceProfile) => void
}

const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      forceStereo: false,
      introSkipper: true,
      introSkipperPrompt: 5,
      classification: 'au',
      nativeAss: true,
      reduceEffects: false,
      preferFallback: false,

      setForceStereo: (value) => set(() => ({ forceStereo: value })),
      setIntroSkipper: (value) => set(() => ({ introSkipper: value })),
      setIntroSkipperPrompt: (value) =>
        set(() => ({ introSkipperPrompt: value })),
      setNativeAss: (value) => set(() => ({ nativeAss: value })),
      setReduceEffects: (value) => set(() => ({ reduceEffects: value })),
      setPreferFallback: (value) => set(() => ({ preferFallback: value })),

      deviceProfile: null,
      setDeviceProfile: (profile) => set(() => ({ deviceProfile: profile })),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => storage),
    },
  ),
)

export default useSettings
