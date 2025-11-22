import { useApi } from '../useApi'
import { useModified } from '../useModified'
import { isValidUuid } from '@/lib/uuid'

export function useBoardWidgetsQuery(boardId: string) {
  const { get, useQuery } = useApi()
  const { modified } = useModified(`board-widgets:${boardId}`)

  return useQuery({
    queryKey: ['board-widgets', { boardId, modified }],
    queryFn: () => {
      return get(`/boards/${boardId}/widgets`)
    },
    enabled: !!boardId && isValidUuid(boardId),
  })
}
