import { DataColumn, DataTable, Icon, MenuItem, Modal, Row, Text } from '@entro314labs/entro-zen';
import Link from 'next/link';
import { useState } from 'react';
import { DateDistance } from '@/components/common/DateDistance';
import { useMessages } from '@/components/hooks';
import { Edit, Trash } from '@/components/icons';
import { MenuButton } from '@/components/input/MenuButton';

export function AdminOrgsTable({
  data = [],
  showActions = true,
}: {
  data: any[];
  showActions?: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const [deleteUser, setDeleteUser] = useState(null);

  // Ensure data is valid and has required fields
  const safeData = Array.isArray(data)
    ? data
        .filter(item => item && (item.orgId || item.id))
        .map((item, index) => ({
          ...item,
          orgId: item.orgId || item.id || `fallback-${index}`,
        }))
    : [];

  return (
    <>
      <DataTable data={safeData} rowKey={(row, index) => row.orgId || `row-${index}`}>
        <DataColumn id="name" label={formatMessage(labels.name)} width="1fr">
          {(row: any) => <Link href={`/admin/orgs/${row.orgId}`}>{row.name}</Link>}
        </DataColumn>
        <DataColumn id="websites" label={formatMessage(labels.members)} width="140px">
          {(row: any) => row?._count?.members}
        </DataColumn>
        <DataColumn id="members" label={formatMessage(labels.websites)} width="140px">
          {(row: any) => row?._count?.websites}
        </DataColumn>
        <DataColumn id="owner" label={formatMessage(labels.owner)}>
          {(row: any) => {
            const member =
              Array.isArray(row?.members) && row.members.length > 0 ? row.members[0] : null;
            const name = member?.user?.username;

            return (
              <Text title={name} truncate>
                {member ? <Link href={`/admin/users/${member.user?.id}`}>{name}</Link> : name}
              </Text>
            );
          }}
        </DataColumn>
        <DataColumn id="created" label={formatMessage(labels.created)} width="160px">
          {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
        </DataColumn>
        {showActions && (
          <DataColumn id="action" align="end" width="50px">
            {(row: any) => {
              const { orgId } = row;

              return (
                <MenuButton>
                  <MenuItem
                    id={`edit-${orgId}`}
                    href={`/admin/orgs/${orgId}`}
                    data-test="link-button-edit"
                  >
                    <Row alignItems="center" gap>
                      <Icon>
                        <Edit />
                      </Icon>
                      <Text>{formatMessage(labels.edit)}</Text>
                    </Row>
                  </MenuItem>
                  <MenuItem
                    id="delete"
                    onAction={() => setDeleteUser(row)}
                    data-test="link-button-delete"
                  >
                    <Row alignItems="center" gap>
                      <Icon>
                        <Trash />
                      </Icon>
                      <Text>{formatMessage(labels.delete)}</Text>
                    </Row>
                  </MenuItem>
                </MenuButton>
              );
            }}
          </DataColumn>
        )}
      </DataTable>
      <Modal isOpen={!!deleteUser}></Modal>
    </>
  );
}
