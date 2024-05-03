import { useQuery } from '@tanstack/react-query'
import { shows } from 'jellyfin-api'
import useClient from 'hooks/useClient'
import ItemsQuery from 'jellyfin-api/lib/types/queries/ItemsQuery'

const useSeasons = (itemId: string, params?: ItemsQuery) => {
  return useQuery({
    queryKey: ['seasons', itemId],
    queryFn: () => {
      return shows.seasons(useClient.getState().api, itemId, params)
    },
  })
}

export default useSeasons
