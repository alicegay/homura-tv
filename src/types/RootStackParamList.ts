import Item from 'jellyfin-api/lib/types/media/Item'

type RootStackParamList = {
  Initial: undefined
  Home: undefined
  Folder: { item: Item; ignoreLengths?: boolean }
  Season: { series: Item }
  Episodes: { season?: Item; series: Item; special?: boolean }
  Details: { item: Item }
  Player: {
    item: Item
    startFrom?: number
    streams: { video: number; audio: number; subtitle: number }
    fallback?: boolean
  }
  Settings: undefined
  SelectServer: undefined
  SelectUser: { server: string }
}

export default RootStackParamList
