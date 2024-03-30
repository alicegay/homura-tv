import { useQuery } from '@tanstack/react-query'
import { shows } from 'jellyfin-api'
import useClient from 'hooks/useClient'

const useShowsNextup = () => {
  return useQuery({
    queryKey: ['showsNextup'],
    queryFn: () => {
      return shows.nextup(useClient.getState().api)
    },
  })
}

export default useShowsNextup
