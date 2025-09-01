import { useApi } from '../useApi';
import { usePagedQuery } from '../usePagedQuery';
import { useModified } from '../useModified';
import { ReactQueryOptions } from '@/lib/types';

export function useLinksQuery({ orgId }: { orgId?: string }, options?: ReactQueryOptions) {
  const { modified } = useModified('links');
  const { get } = useApi();

  return usePagedQuery({
    queryKey: ['links', { orgId, modified }],
    queryFn: pageParams => {
      return get(orgId ? `/orgs/${orgId}/links` : '/links', pageParams);
    },
    ...options,
  });
}
