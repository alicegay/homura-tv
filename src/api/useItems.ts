import { useQuery } from '@tanstack/react-query'
import { users } from 'jellyfin-api'
import useClient from 'hooks/useClient'
import ItemsQuery from 'jellyfin-api/lib/types/users/ItemsQuery'

const useItems = (itemId: string, params?: ItemsQuery) => {
  return useQuery({
    queryKey: ['items', itemId],
    queryFn: () => {
      return users.items(useClient.getState().api, {
        ...params,
        ParentId: itemId,
      })
    },
  })
}

export default useItems
