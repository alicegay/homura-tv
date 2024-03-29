import { create } from 'zustand'

interface ThemeStore {
  background: string
  foreground: string
  tint: string
  font400: string
  font500: string
  font700: string
}

const useThemeStore = create<ThemeStore>()(() => ({
  background: '#222',
  foreground: '#eee',
  tint: '#A00000',
  font400: 'NunitoRoundedMplus-Regular',
  font500: 'NunitoRoundedMplus-Medium',
  font700: 'NunitoRoundedMplus-Bold',
}))

export default useThemeStore
