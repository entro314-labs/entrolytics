import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

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
