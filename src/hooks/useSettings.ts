import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import DeviceProfile from 'jellyfin-api/lib/types/queries/DeviceProfile'
import { storage } from 'lib/storage'

interface SettingsStore {
  forceStereo: boolean
  introSkipper: boolean
  introSkipperPrompt: number
  classification: 'au' | 'jp' | 'uk' | 'us'
  burninSRT: boolean
  burninASS: boolean
  burninPGS: boolean

  setForceStereo: (value: boolean) => void
  setIntroSkipper: (value: boolean) => void
  setIntroSkipperPrompt: (value: number) => void
  setBurninSRT: (value: boolean) => void
  setBurninASS: (value: boolean) => void
  setBurninPGS: (value: boolean) => void

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
      burninSRT: false,
      burninASS: false,
      burninPGS: false,

      setForceStereo: (value) => set(() => ({ forceStereo: value })),
      setIntroSkipper: (value) => set(() => ({ introSkipper: value })),
      setIntroSkipperPrompt: (value) =>
        set(() => ({ introSkipperPrompt: value })),
      setBurninSRT: (value) => set(() => ({ burninSRT: value })),
      setBurninASS: (value) => set(() => ({ burninASS: value })),
      setBurninPGS: (value) => set(() => ({ burninPGS: value })),

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
