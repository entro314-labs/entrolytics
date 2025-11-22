import { useApi } from '../useApi'
import { usePagedQuery } from '../usePagedQuery'
import { useModified } from '../useModified'
import { useFilterParameters } from '../useFilterParameters'
import { useDateParameters } from '../useDateParameters'

export function useWebsiteSessionsQuery(
  websiteId: string,
  params?: Record<string, string | number>
) {
  const { get } = useApi()
  const { modified } = useModified(`sessions`)
  const { startAt, endAt, unit, timezone } = useDateParameters()
  const filters = useFilterParameters()

  return usePagedQuery({
    queryKey: [
      'sessions',
      {
        websiteId,
        modified,
        startAt,
        endAt,
        unit,
        timezone,
        ...params,
        ...filters,
      },
    ],
    queryFn: (pageParams) => {
      return get(`/websites/${websiteId}/sessions`, {
        startAt,
        endAt,
        unit,
        timezone,
        ...filters,
        ...pageParams,
        ...params,
        pageSize: 20,
      })
    },
  })
}
