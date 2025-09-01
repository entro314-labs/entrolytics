import { DataGrid } from '@/components/common/DataGrid';
import { OrgMembersTable } from './OrgMembersTable';
import { useOrgMembersQuery } from '@/components/hooks';

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
