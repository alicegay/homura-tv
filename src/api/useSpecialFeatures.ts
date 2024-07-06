import { useQuery } from '@tanstack/react-query'
import { users } from 'jellyfin-api'
import useClient from 'hooks/useClient'
import ItemsQuery from 'jellyfin-api/lib/types/queries/ItemsQuery'

const useSpecialFeatures = (itemId: string, params?: ItemsQuery) => {
  return useQuery({
    queryKey: ['specials', itemId],
    queryFn: () => {
      return users.specialFeatures(useClient.getState().api, itemId, params)
    },
  })
}

export default useSpecialFeatures
