import { DataColumn, DataTable, Icon, Row, Text } from '@entro314labs/entro-zen';
import Link from 'next/link';
import { Avatar } from '@/components/common/Avatar';
import { DateDistance } from '@/components/common/DateDistance';
import { Empty } from '@/components/common/Empty';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useFormat, useMessages, useNavigation } from '@/components/hooks';
import { Eye, LightningSvg } from '@/components/icons';

export function EventsTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const { formatValue } = useFormat();

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <DataTable data={data} rowKey={(row, index) => row?.eventId || row?.id || `event-${index}`}>
      <DataColumn id="event" label={formatMessage(labels.event)} width="2fr">
        {(row: any) => {
          return (
            <Row alignItems="center" gap="2">
              <Link href={renderUrl(`/websites/${row.websiteId}/sessions/${row.sessionId}`)}>
                <Avatar seed={row.sessionId} size={32} />
              </Link>
              <Icon>{row.eventName ? <LightningSvg /> : <Eye />}</Icon>
              <Text>
                {formatMessage(row.eventName ? labels.triggeredEvent : labels.viewedPage)}
              </Text>
              <Text weight="bold" style={{ maxWidth: '300px' }} truncate>
                {row.eventName || row.urlPath}
              </Text>
            </Row>
          );
        }}
      </DataColumn>
      <DataColumn id="location" label={formatMessage(labels.location)}>
        {(row: any) => (
          <TypeIcon type="country" value={row.country}>
            {row.city ? `${row.city}, ` : ''} {formatValue(row.country, 'country')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="browser" label={formatMessage(labels.browser)} width="140px">
        {(row: any) => (
          <TypeIcon type="browser" value={row.browser}>
            {formatValue(row.browser, 'browser')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="device" label={formatMessage(labels.device)} width="120px">
        {(row: any) => (
          <TypeIcon type="device" value={row.device}>
            {formatValue(row.device, 'device')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="created" width="160px" align="end">
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
    </DataTable>
  );
}
