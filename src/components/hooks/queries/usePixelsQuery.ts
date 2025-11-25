import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function usePixelsQuery({ orgId }: { orgId?: string }, options?: ReactQueryOptions) {
  const { modified } = useModified('pixels');
  const { get } = useApi();

  return usePagedQuery({
    queryKey: ['pixels', { orgId, modified }],
    queryFn: pageParams => {
      return get(orgId ? `/orgs/${orgId}/pixels` : '/pixels', pageParams);
    },
    ...options,
  });
}
