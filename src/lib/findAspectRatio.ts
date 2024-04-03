const collectionTypeAspectRatios = {
  tvshows: 'tall',
  movies: 'tall',
  musicvideos: 'wide',
  livetv: 'wide',
  music: 'square',
  playlists: 'square',
}

type aspectRatio = 'wide' | 'tall' | 'square'

const findAspectRatio = (collectionType: string | undefined): aspectRatio => {
  if (
    collectionType &&
    collectionTypeAspectRatios.hasOwnProperty(collectionType)
  ) {
    return collectionTypeAspectRatios[collectionType as aspectRatio]
  }
  return 'wide'
}

export default findAspectRatio
