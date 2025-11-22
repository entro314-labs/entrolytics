import { useApi } from '../useApi'
import { usePagedQuery } from '../usePagedQuery'
import { useModified } from '../useModified'

export function useOrgWebsitesQuery(orgId: string) {
  const { get } = useApi()
  const { modified } = useModified(`websites`)

  return usePagedQuery({
    queryKey: ['orgs:websites', { orgId, modified }],
    queryFn: (params: any) => {
      return get(`/orgs/${orgId}/websites`, params)
    },
  })
}
