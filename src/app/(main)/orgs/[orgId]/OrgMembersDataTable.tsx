import { DataGrid } from '@/components/common/DataGrid';
import { useOrgMembersQuery } from '@/components/hooks';
import { OrgMembersTable } from './OrgMembersTable';

export function OrgMembersDataTable({
  orgId,
  allowEdit = false,
}: {
  orgId: string;
  allowEdit?: boolean;
}) {
  const queryResult = useOrgMembersQuery(orgId);

  return (
    <DataGrid query={queryResult} allowSearch>
      {({ data }) => <OrgMembersTable data={data} orgId={orgId} allowEdit={allowEdit} />}
    </DataGrid>
  );
}
