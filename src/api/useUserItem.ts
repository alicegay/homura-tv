import { useQuery } from '@tanstack/react-query'
import { users } from 'jellyfin-api'
import useClient from 'hooks/useClient'

const useUserItem = (itemId: string) => {
  return useQuery({
    queryKey: ['useritem', itemId],
    queryFn: () => {
      return users.singleItem(useClient.getState().api, itemId)
    },
  })
}

export default useUserItem
