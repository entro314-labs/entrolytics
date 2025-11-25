import { keepPreviousData } from '@tanstack/react-query';
import { useModified } from '@/components/hooks';
import type { ReactQueryOptions } from '@/lib/types';
import { isValidUuid } from '@/lib/uuid';
import { useApi } from '../useApi';

export function useWebsiteSegmentQuery(
  websiteId: string,
  segmentId: string,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`segments`);

  return useQuery({
    queryKey: ['website:segments', { websiteId, segmentId, modified }],
    queryFn: () => get(`/websites/${websiteId}/segments/${segmentId}`),
    enabled: !!(websiteId && segmentId) && isValidUuid(websiteId) && isValidUuid(segmentId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
