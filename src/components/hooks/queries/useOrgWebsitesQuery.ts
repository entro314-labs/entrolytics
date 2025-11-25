import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useOrgWebsitesQuery(orgId: string) {
  const { get } = useApi();
  const { modified } = useModified(`websites`);

  return usePagedQuery({
    queryKey: ['orgs:websites', { orgId, modified }],
    queryFn: (params: any) => {
      return get(`/orgs/${orgId}/websites`, params);
    },
  });
}
