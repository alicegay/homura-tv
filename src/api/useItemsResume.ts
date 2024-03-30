import { useQuery } from '@tanstack/react-query'
import { users } from 'jellyfin-api'
import useClient from 'hooks/useClient'

const useItemsResume = () => {
  return useQuery({
    queryKey: ['itemsResume'],
    queryFn: () => {
      return users.itemsResume(useClient.getState().api)
    },
  })
}

export default useItemsResume
