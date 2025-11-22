import { useApi } from '../useApi'
import { useModified } from '../useModified'

export function useUserOrgsQuery(userId: string) {
  const { get, useQuery } = useApi()
  const { modified } = useModified(`orgs`)

  return useQuery({
    queryKey: ['orgs', { userId, modified }],
    queryFn: () => {
      return get(`/users/${userId}/orgs`, { userId })
    },
    enabled: !!userId,
  })
}
