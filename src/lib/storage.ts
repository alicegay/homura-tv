import { StateStorage } from 'zustand/middleware'
import { createMMKV } from 'react-native-mmkv'

const mmkv = createMMKV()

export const storage: StateStorage = {
  setItem: (name, value) => {
    return mmkv.set(name, value)
  },
  getItem: (name) => {
    const value = mmkv.getString(name)
    return value ?? null
  },
  removeItem: (name) => {
    return mmkv.remove(name)
  },
}
