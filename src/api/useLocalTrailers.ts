import { useQuery } from '@tanstack/react-query'
import { users } from 'jellyfin-api'
import useClient from 'hooks/useClient'
import ItemsQuery from 'jellyfin-api/lib/types/queries/ItemsQuery'

const useLocalTrailers = (itemId: string, params?: ItemsQuery) => {
  return useQuery({
    queryKey: ['trailers', itemId],
    queryFn: () => {
      return users.localTrailers(useClient.getState().api, itemId, params)
    },
  })
}

export default useLocalTrailers
