import { keepPreviousData } from '@tanstack/react-query';
import { useModified } from '@/components/hooks';
import type { ReactQueryOptions } from '@/lib/types';
import { isValidUuid } from '@/lib/uuid';
import { useApi } from '../useApi';

export function useWebsiteCohortQuery(
  websiteId: string,
  cohortId: string,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`cohorts`);

  return useQuery({
    queryKey: ['website:cohorts', { websiteId, cohortId, modified }],
    queryFn: () => get(`/websites/${websiteId}/segments/${cohortId}`),
    enabled: !!(websiteId && cohortId) && isValidUuid(websiteId) && isValidUuid(cohortId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
