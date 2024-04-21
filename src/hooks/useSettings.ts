import AsyncStorage from '@react-native-async-storage/async-storage'
import DeviceProfile from 'jellyfin-api/lib/types/queries/DeviceProfile'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SettingsStore {
  audio: {
    forceStereo: boolean
  }
  setAudio: (key: string, value: any) => void
  deviceProfile: DeviceProfile | null
  setDeviceProfile: (profile: DeviceProfile) => void
}

const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      audio: {
        forceStereo: false,
      },
      setAudio: (key, value) =>
        set((state) => ({ audio: { ...state.audio, [key]: value } })),
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
