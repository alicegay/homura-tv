import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios, { AxiosInstance } from 'axios'
import { Client } from 'jellyfin-api'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface ClientStore {
  client: AxiosInstance | null
  server: string | null
  name: string | null
  user: string | null
  token: string | null
  deviceID: string | null
  api: Client
  setClient: (data: {
    server: string
    clientName: string
    deviceName: string
    deviceID: string
    version: string
    user: string
    token: string
  }) => void
  signout: () => void
  clear: () => void
  setName: (name: string) => void

  hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

const useClient = create<ClientStore>()(
  persist(
    (set) => ({
      client: null,
      server: null,
      name: null,
      user: null,
      token: null,
      deviceID: null,
      api: {
        client: null,
        server: null,
        user: null,
      },
      setClient: (data) => {
        const auth =
          'MediaBrowser Client="' +
          data.clientName +
          '", Device="' +
          data.deviceName +
          '", DeviceId="' +
          data.deviceID +
          '", Version="' +
          data.version +
          '", Token="' +
          data.token +
          '"'
        const client = axios.create({
          baseURL: data.server,
          headers: { Authorization: auth },
        })
        set(() => ({
          client: client,
          server: data.server,
          user: data.user,
          token: data.token,
          deviceID: data.deviceID,
          api: {
            client: client,
            server: data.server,
            user: data.user,
          },
        }))
      },
      signout: () => set(() => ({ client: null, user: null, token: null })),
      clear: () =>
        set(() => ({
          client: null,
          server: null,
          name: null,
          user: null,
          token: null,
        })),
      setName: (name) => set(() => ({ name: name })),

      hasHydrated: false,
      setHasHydrated: (state) => set(() => ({ hasHydrated: state })),
    }),
    {
      name: 'client',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true)
      },
    },
  ),
)

export default useClient
