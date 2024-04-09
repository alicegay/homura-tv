import Item from 'jellyfin-api/lib/types/media/Item'

type RootStackParamList = {
  Initial: undefined
  Home: undefined
  Folder: { item: Item; ignoreLengths?: boolean }
  VideoDetails: { item: Item }
}

export default RootStackParamList
