import { create } from 'zustand'

interface ThemeStore {
  background: string
  foreground: string
  tint: string
}

const useThemeStore = create<ThemeStore>()(() => ({
  background: '#222',
  foreground: '#eee',
  tint: '#A00000',
}))

export default useThemeStore
