import { useApi } from '../useApi'
import { useModified } from '@/components/hooks'
import { keepPreviousData } from '@tanstack/react-query'
import { ReactQueryOptions } from '@/lib/types'
import { isValidUuid } from '@/lib/uuid'

export function useWebsiteCohortQuery(
  websiteId: string,
  cohortId: string,
  options?: ReactQueryOptions
) {
  const { get, useQuery } = useApi()
  const { modified } = useModified(`cohorts`)

  return useQuery({
    queryKey: ['website:cohorts', { websiteId, cohortId, modified }],
    queryFn: () => get(`/websites/${websiteId}/segments/${cohortId}`),
    enabled: !!(websiteId && cohortId) && isValidUuid(websiteId) && isValidUuid(cohortId),
    placeholderData: keepPreviousData,
    ...options,
  })
}
