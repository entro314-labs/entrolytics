import { keepPreviousData } from '@tanstack/react-query';
import { useModified } from '@/components/hooks';
import type { ReactQueryOptions } from '@/lib/types';
import { isValidUuid } from '@/lib/uuid';
import { useApi } from '../useApi';

export function useUserQuery(userId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`user:${userId}`);

  return useQuery({
    queryKey: ['users', { userId, modified }],
    queryFn: () => get(`/users/${userId}`),
    enabled: !!userId && isValidUuid(userId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
