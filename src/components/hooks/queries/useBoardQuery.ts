import { isValidUuid } from '@/lib/uuid';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useBoardQuery(boardId: string) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`board:${boardId}`);

  return useQuery({
    queryKey: ['board', { boardId, modified }],
    queryFn: () => {
      return get(`/boards/${boardId}`);
    },
    enabled: !!boardId && isValidUuid(boardId),
  });
}
