import { StatusLight, Text } from '@entro314labs/entro-zen';
import { useMemo } from 'react';
import { useActiveUsersQuery, useMessages } from '@/components/hooks';

export function ActiveUsers({
  websiteId,
  value,
  refetchInterval = 60000,
}: {
  websiteId: string;
  value?: number;
  refetchInterval?: number;
}) {
  const { formatMessage, labels } = useMessages();
  const { data } = useActiveUsersQuery(websiteId, { refetchInterval });

  const count = useMemo(() => {
    if (websiteId) {
      return data?.visitors || 0;
    }

    return value !== undefined ? value : 0;
  }, [data, value, websiteId]);

  if (count === 0) {
    return null;
  }

  return (
    <StatusLight variant="success">
      <Text size="2" weight="medium">
        {count} {formatMessage(labels.online)}
      </Text>
    </StatusLight>
  );
}
