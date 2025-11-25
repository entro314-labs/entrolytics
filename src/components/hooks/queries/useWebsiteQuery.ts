import { keepPreviousData } from '@tanstack/react-query';
import { useModified } from '@/components/hooks';
import type { ReactQueryOptions } from '@/lib/types';
import { isValidUuid } from '@/lib/uuid';
import { useApi } from '../useApi';

export function useWebsiteQuery(websiteId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`website:${websiteId}`);

  return useQuery({
    queryKey: ['website', { websiteId, modified }],
    queryFn: () => get(`/websites/${websiteId}`),
    enabled: !!websiteId && isValidUuid(websiteId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
