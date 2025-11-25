import { DataColumn, DataTable } from '@entro314labs/entro-zen';
import Link from 'next/link';
import { useMessages } from '@/components/hooks';

export function OrgWebsitesTable({
  orgId,
  data = [],
  allowEdit = false,
}: {
  orgId: string;
  data: any[];
  allowEdit?: boolean;
}) {
  const { formatMessage, labels } = useMessages();

  // Ensure data is valid and has required fields
  const safeData = Array.isArray(data)
    ? data
        .filter(item => item && (item.websiteId || item.id))
        .map((item, index) => ({
          ...item,
          websiteId: item.websiteId || item.id || `fallback-${index}`,
        }))
    : [];

  return (
    <DataTable data={safeData} rowKey={(row, index) => row.websiteId || `row-${index}`}>
      <DataColumn id="name" label={formatMessage(labels.name)}>
        {(row: any) => <Link href={`/orgs/${orgId}/websites/${row.websiteId}`}>{row.name}</Link>}
      </DataColumn>
      <DataColumn id="domain" label={formatMessage(labels.domain)} />
      <DataColumn id="createdBy" label={formatMessage(labels.createdBy)}>
        {(row: any) => row?.createUser?.displayName || row?.createUser?.email}
      </DataColumn>
    </DataTable>
  );
}
