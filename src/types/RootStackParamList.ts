import Item from 'jellyfin-api/lib/types/media/Item'

type RootStackParamList = {
  Initial: undefined
  Home: undefined
  Folder: { item: Item }
  VideoDetails: { item: Item }
}

export default RootStackParamList
