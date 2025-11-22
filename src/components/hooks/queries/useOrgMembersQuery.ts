import { useApi } from '../useApi'
import { usePagedQuery } from '../usePagedQuery'
import { useModified } from '../useModified'
import { isValidUuid } from '@/lib/uuid'

export function useOrgMembersQuery(orgId: string) {
  const { get } = useApi()
  const { modified } = useModified(`orgs:members`)

  return usePagedQuery({
    queryKey: ['orgs:members', { orgId, modified }],
    queryFn: (params: any) => {
      return get(`/orgs/${orgId}/users`, params)
    },
    enabled: !!orgId && isValidUuid(orgId),
  })
}
