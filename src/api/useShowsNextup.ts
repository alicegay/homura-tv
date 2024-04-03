import { useQuery } from '@tanstack/react-query'
import { shows } from 'jellyfin-api'
import useClient from 'hooks/useClient'
import ItemsQuery from 'jellyfin-api/lib/types/users/ItemsQuery'

const useShowsNextup = (params?: ItemsQuery) => {
  return useQuery({
    queryKey: ['showsNextup'],
    queryFn: () => {
      return shows.nextup(useClient.getState().api, params)
    },
  })
}

export default useShowsNextup
