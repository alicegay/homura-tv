import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SettingsStore {}

const useSettings = create<SettingsStore>()(
  persist((set) => ({}), {
    name: 'settings',
    storage: createJSONStorage(() => AsyncStorage),
  }),
)

export default useSettings
