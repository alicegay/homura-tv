import { useQuery } from '@tanstack/react-query'
import { users } from 'jellyfin-api'
import useClient from 'hooks/useClient'

const useItem = (itemId: string) => {
  return useQuery({
    queryKey: ['item', itemId],
    queryFn: () => {
      return users.singleItem(useClient.getState().api, itemId)
    },
  })
}

export default useItem
