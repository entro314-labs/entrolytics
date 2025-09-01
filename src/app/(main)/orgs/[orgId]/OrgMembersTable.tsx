import { DataColumn, DataTable, Row } from '@entro314labs/entro-zen';
import { useMessages } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { OrgMemberRemoveButton } from './OrgMemberRemoveButton';
import { OrgMemberEditButton } from './OrgMemberEditButton';

export function OrgMembersTable({
  data = [],
  orgId,
  allowEdit = false,
}: {
  data: any[];
  orgId: string;
  allowEdit: boolean;
}) {
  const { formatMessage, labels } = useMessages();

  const roles = {
    [ROLES.orgOwner]: formatMessage(labels.orgOwner),
    [ROLES.orgManager]: formatMessage(labels.orgManager),
    [ROLES.orgMember]: formatMessage(labels.orgMember),
    [ROLES.orgViewOnly]: formatMessage(labels.viewOnly),
  };

  return (
    <DataTable data={data}>
      <DataColumn id="username" label={formatMessage(labels.username)}>
        {(row: any) => row?.user?.username}
      </DataColumn>
      <DataColumn id="role" label={formatMessage(labels.role)}>
        {(row: any) => roles[row?.role]}
      </DataColumn>
      {allowEdit && (
        <DataColumn id="action" align="end">
          {(row: any) => {
            if (row?.role === ROLES.orgOwner) {
              return null;
            }

            return (
              <Row alignItems="center">
                <OrgMemberEditButton orgId={orgId} userId={row?.user?.id} role={row?.role} />
                <OrgMemberRemoveButton
                  orgId={orgId}
                  userId={row?.user?.id}
                  userName={row?.user?.username}
                />
              </Row>
            );
          }}
        </DataColumn>
      )}
    </DataTable>
  );
}
