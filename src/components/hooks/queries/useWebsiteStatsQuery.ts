import type { UseQueryOptions } from '@tanstack/react-query';
import { useDateParameters } from '@/components/hooks/useDateParameters';
import { isValidUuid } from '@/lib/uuid';
import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';

export interface WebsiteStatsData {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
  comparison: {
    pageviews: number;
    visitors: number;
    visits: number;
    bounces: number;
    totaltime: number;
  };
}

export function useWebsiteStatsQuery(
  websiteId: string,
  options?: UseQueryOptions<WebsiteStatsData, Error, WebsiteStatsData>,
) {
  const { get, useQuery } = useApi();
  const date = useDateParameters();
  const filters = useFilterParameters();

  return useQuery<WebsiteStatsData>({
    queryKey: ['websites:stats', { websiteId, ...date, ...filters }],
    queryFn: () => get(`/websites/${websiteId}/stats`, { ...date, ...filters }),
    enabled: !!websiteId && isValidUuid(websiteId),
    ...options,
  });
}
