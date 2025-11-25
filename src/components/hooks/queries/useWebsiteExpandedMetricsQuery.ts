import { keepPreviousData } from '@tanstack/react-query';
import type { ReactQueryOptions } from '@/lib/types';
import { isValidUuid } from '@/lib/uuid';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export type WebsiteExpandedMetricsData = {
  name: string;
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}[];

export function useWebsiteExpandedMetricsQuery(
  websiteId: string,
  params: { type: string; limit?: number; search?: string },
  options?: ReactQueryOptions<WebsiteExpandedMetricsData>,
) {
  const { get, useQuery } = useApi();
  const date = useDateParameters();
  const filters = useFilterParameters();

  return useQuery<WebsiteExpandedMetricsData>({
    queryKey: [
      'websites:metrics:expanded',
      {
        websiteId,
        ...date,
        ...filters,
        ...params,
      },
    ],
    queryFn: async () =>
      get(`/websites/${websiteId}/metrics/expanded`, {
        ...date,
        ...filters,
        ...params,
      }),
    enabled: !!websiteId && isValidUuid(websiteId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
