import { useQuery } from '@tanstack/react-query'
import { users } from 'jellyfin-api'
import useClient from 'hooks/useClient'
import ItemsQuery from 'jellyfin-api/lib/types/queries/ItemsQuery'

const useUserItems = (itemId: string, params?: ItemsQuery) => {
  return useQuery({
    queryKey: ['useritems', itemId, params],
    queryFn: () => {
      return users.items(useClient.getState().api, {
        ...params,
        ParentId: itemId,
      })
    },
  })
}

export default useUserItems
