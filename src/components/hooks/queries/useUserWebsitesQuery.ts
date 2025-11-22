import { useApi } from '../useApi'
import { usePagedQuery } from '../usePagedQuery'
import { useModified } from '../useModified'
import { ReactQueryOptions } from '@/lib/types'

export function useUserWebsitesQuery(
  { userId, orgId }: { userId?: string; orgId?: string },
  params?: Record<string, any>,
  options?: ReactQueryOptions
) {
  const { get } = useApi()
  const { modified } = useModified(`websites`)

  return usePagedQuery({
    queryKey: ['websites', { userId, orgId, modified, ...params }],
    queryFn: (pageParams) => {
      return get(
        orgId ? `/orgs/${orgId}/websites` : userId ? `/users/${userId}/websites` : '/me/websites',
        {
          ...pageParams,
          ...params,
        }
      )
    },
    ...options,
  })
}
