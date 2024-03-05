import { create } from 'zustand'

interface ThemeStore {
  background: string
  foreground: string
}

const useThemeStore = create<ThemeStore>()(() => ({
  background: '#222',
  foreground: '#eee',
}))

export default useThemeStore
