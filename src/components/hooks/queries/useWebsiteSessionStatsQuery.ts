import { useApi } from '../useApi'
import { useFilterParameters } from '../useFilterParameters'
import { useDateParameters } from '../useDateParameters'
import { isValidUuid } from '@/lib/uuid'

export function useWebsiteSessionStatsQuery(websiteId: string, options?: Record<string, string>) {
  const { get, useQuery } = useApi()
  const { startAt, endAt, unit, timezone } = useDateParameters()
  const filters = useFilterParameters()

  return useQuery({
    queryKey: ['sessions:stats', { websiteId, startAt, endAt, unit, timezone, ...filters }],
    queryFn: () =>
      get(`/websites/${websiteId}/sessions/stats`, {
        startAt,
        endAt,
        unit,
        timezone,
        ...filters,
      }),
    enabled: !!websiteId && isValidUuid(websiteId),
    ...options,
  })
}
