import { useApi } from '../useApi'
import { usePagedQuery } from '../usePagedQuery'
import { useModified } from '../useModified'
import { ReactQueryOptions } from '@/lib/types'

export function usePixelsQuery({ orgId }: { orgId?: string }, options?: ReactQueryOptions) {
  const { modified } = useModified('pixels')
  const { get } = useApi()

  return usePagedQuery({
    queryKey: ['pixels', { orgId, modified }],
    queryFn: (pageParams) => {
      return get(orgId ? `/orgs/${orgId}/pixels` : '/pixels', pageParams)
    },
    ...options,
  })
}
