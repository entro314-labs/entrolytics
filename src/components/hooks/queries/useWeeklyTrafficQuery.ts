import { useFilterParameters } from '@/components/hooks/useFilterParameters';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useModified } from '../useModified';

export function useWeeklyTrafficQuery(websiteId: string, params?: Record<string, string | number>) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`sessions`);
  const date = useDateParameters();
  const filters = useFilterParameters();

  return useQuery({
    queryKey: ['sessions', { websiteId, modified, ...params, ...date, ...filters }],
    queryFn: () => {
      return get(`/websites/${websiteId}/sessions/weekly`, {
        ...params,
        ...date,
        ...filters,
      });
    },
  });
}
