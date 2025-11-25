import { keepPreviousData } from '@tanstack/react-query';
import { useModified } from '@/components/hooks';
import type { ReactQueryOptions } from '@/lib/types';
import { isValidUuid } from '@/lib/uuid';
import { useApi } from '../useApi';

export function useOrgQuery(orgId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`orgs:${orgId}`);

  return useQuery({
    queryKey: ['orgs', { orgId, modified }],
    queryFn: () => get(`/orgs/${orgId}`),
    enabled: !!orgId && isValidUuid(orgId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
