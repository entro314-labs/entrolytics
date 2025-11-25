import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useBoardsQuery({ orgId }: { orgId?: string }, options?: ReactQueryOptions) {
  const { modified } = useModified('boards');
  const { get } = useApi();

  return usePagedQuery({
    queryKey: ['boards', { orgId, modified }],
    queryFn: pageParams => {
      return get(orgId ? `/orgs/${orgId}/boards` : '/boards', pageParams);
    },
    ...options,
  });
}
