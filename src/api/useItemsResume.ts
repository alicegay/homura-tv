import { useQuery } from '@tanstack/react-query'
import { users } from 'jellyfin-api'
import useClient from 'hooks/useClient'
import ItemsQuery from 'jellyfin-api/lib/types/queries/ItemsQuery'

const useItemsResume = (params?: ItemsQuery) => {
  return useQuery({
    queryKey: ['itemsResume'],
    queryFn: () => {
      return users.itemsResume(useClient.getState().api, params)
    },
  })
}

export default useItemsResume
