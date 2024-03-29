import { create } from 'zustand'

interface ThemeStore {
  background: string
  foreground: string
  tint: string
  font400: string
  font500: string
  font700: string
}

const useTheme = create<ThemeStore>()(() => ({
  background: '#1a1a1a',
  foreground: '#eee',
  tint: '#A00000',
  font400: 'NunitoRoundedMplus-Regular',
  font500: 'NunitoRoundedMplus-Medium',
  font700: 'NunitoRoundedMplus-Bold',
}))

export default useTheme
