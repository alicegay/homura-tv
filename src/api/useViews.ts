import { useQuery } from '@tanstack/react-query'
import { users } from 'jellyfin-api'
import useClient from 'hooks/useClient'

const useViews = () => {
  return useQuery({
    queryKey: ['views'],
    queryFn: async () => {
      const res = await users.views(useClient.getState().api)
      return res.Items.filter(
        (item) =>
          item.CollectionType !== 'playlists' &&
          item.CollectionType !== 'music' &&
          item.CollectionType !== 'books',
      )
    },
  })
}

export default useViews
