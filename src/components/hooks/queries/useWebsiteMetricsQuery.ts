import { keepPreviousData } from '@tanstack/react-query';
import type { ReactQueryOptions } from '@/lib/types';
import { isValidUuid } from '@/lib/uuid';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export type WebsiteMetricsData = {
  x: string;
  y: number;
}[];

export function useWebsiteMetricsQuery(
  websiteId: string,
  params: { type: string; limit?: number; search?: string },
  options?: ReactQueryOptions<WebsiteMetricsData>,
) {
  const { get, useQuery } = useApi();
  const date = useDateParameters();
  const filters = useFilterParameters();

  return useQuery<WebsiteMetricsData>({
    queryKey: [
      'websites:metrics',
      {
        websiteId,
        ...date,
        ...filters,
        ...params,
      },
    ],
    queryFn: async () =>
      get(`/websites/${websiteId}/metrics`, {
        ...date,
        ...filters,
        ...params,
      }),
    enabled: !!websiteId && isValidUuid(websiteId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
