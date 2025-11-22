import { useApi } from '../useApi'
import { usePagedQuery } from '../usePagedQuery'
import { useModified } from '../useModified'
import { ReactQueryOptions } from '@/lib/types'

export function useBoardsQuery({ orgId }: { orgId?: string }, options?: ReactQueryOptions) {
  const { modified } = useModified('boards')
  const { get } = useApi()

  return usePagedQuery({
    queryKey: ['boards', { orgId, modified }],
    queryFn: (pageParams) => {
      return get(orgId ? `/orgs/${orgId}/boards` : '/boards', pageParams)
    },
    ...options,
  })
}
