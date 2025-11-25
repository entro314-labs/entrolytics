import { DataColumn, DataTable, Row } from '@entro314labs/entro-zen';
import Link from 'next/link';
import { CohortDeleteButton } from '@/app/(main)/websites/[websiteId]/cohorts/CohortDeleteButton';
import { CohortEditButton } from '@/app/(main)/websites/[websiteId]/cohorts/CohortEditButton';
import { DateDistance } from '@/components/common/DateDistance';
import { Empty } from '@/components/common/Empty';
import { useMessages, useNavigation } from '@/components/hooks';
import { filtersObjectToArray } from '@/lib/params';

export function CohortsTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { websiteId, renderUrl } = useNavigation();

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <DataTable data={data} rowKey={(row, index) => row?.id || `cohort-${index}`}>
      <DataColumn id="name" label={formatMessage(labels.name)}>
        {(row: any) => (
          <Link href={renderUrl(`/websites/${websiteId}?cohort=${row.id}`, false)}>{row.name}</Link>
        )}
      </DataColumn>
      <DataColumn id="created" label={formatMessage(labels.created)}>
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
      <DataColumn id="action" align="end" width="100px">
        {(row: any) => {
          const { id, name, parameters } = row;

          return (
            <Row>
              <CohortEditButton
                cohortId={id}
                websiteId={websiteId}
                filters={filtersObjectToArray(parameters)}
              />
              <CohortDeleteButton cohortId={id} websiteId={websiteId} name={name} />
            </Row>
          );
        }}
      </DataColumn>
    </DataTable>
  );
}
