import { WebsitesTable } from './WebsitesTable';
import { DataGrid } from '@/components/common/DataGrid';
import { useUserWebsitesQuery } from '@/components/hooks';

export function WebsitesDataTable({
  orgId,
  allowEdit = true,
  allowView = true,
  showActions = true,
}: {
  orgId?: string;
  allowEdit?: boolean;
  allowView?: boolean;
  showActions?: boolean;
}) {
  const queryResult = useUserWebsitesQuery({ orgId });

  return (
    <DataGrid query={queryResult} allowSearch allowPaging>
      {({ data }) => (
        <WebsitesTable
          orgId={orgId}
          data={data}
          showActions={showActions}
          allowEdit={allowEdit}
          allowView={allowView}
        />
      )}
    </DataGrid>
  );
}
