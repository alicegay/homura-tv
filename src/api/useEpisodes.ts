import { useQuery } from '@tanstack/react-query'
import { shows } from 'jellyfin-api'
import useClient from 'hooks/useClient'
import ItemsQuery from 'jellyfin-api/lib/types/users/ItemsQuery'

const useEpisodes = (itemId: string, params?: ItemsQuery) => {
  return useQuery({
    queryKey: ['episodes', itemId, params],
    queryFn: () => {
      return shows.episodes(useClient.getState().api, itemId, params)
    },
  })
}

export default useEpisodes
