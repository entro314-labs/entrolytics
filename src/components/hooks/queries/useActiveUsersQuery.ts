import { useApi } from '../useApi'
import { ReactQueryOptions } from '@/lib/types'
import { isValidUuid } from '@/lib/uuid'

export function useActiveUsersQuery(websiteId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi()
  return useQuery<any>({
    queryKey: ['websites:active', websiteId],
    queryFn: () => get(`/websites/${websiteId}/active`),
    enabled: !!websiteId && isValidUuid(websiteId),
    ...options,
  })
}
