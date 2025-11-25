import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useOrgsQuery(params?: Record<string, any>, options?: ReactQueryOptions) {
  const { get } = useApi();
  const { modified } = useModified(`orgs`);

  return usePagedQuery({
    queryKey: ['orgs:admin', { modified, ...params }],
    queryFn: pageParams => {
      return get(`/admin/orgs`, {
        ...pageParams,
        ...params,
      });
    },
    ...options,
  });
}
