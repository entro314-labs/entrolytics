import { useApi } from '../useApi'
import { useModified } from '../useModified'
import { isValidUuid } from '@/lib/uuid'

export function useLinkQuery(linkId: string) {
  const { get, useQuery } = useApi()
  const { modified } = useModified(`link:${linkId}`)

  return useQuery({
    queryKey: ['link', { linkId, modified }],
    queryFn: () => {
      return get(`/links/${linkId}`)
    },
    enabled: !!linkId && isValidUuid(linkId),
  })
}
