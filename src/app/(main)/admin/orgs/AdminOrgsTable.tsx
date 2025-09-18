import { useState } from 'react'
import { Row, Text, Icon, DataTable, DataColumn, MenuItem, Modal } from '@entro314labs/entro-zen'
import Link from 'next/link'
import { Trash } from '@/components/icons'
import { useMessages } from '@/components/hooks'
import { Edit } from '@/components/icons'
import { MenuButton } from '@/components/input/MenuButton'
import { DateDistance } from '@/components/common/DateDistance'

export function AdminOrgsTable({
  data = [],
  showActions = true,
}: {
  data: any[]
  showActions?: boolean
}) {
  const { formatMessage, labels } = useMessages()
  const [deleteUser, setDeleteUser] = useState(null)

  return (
    <>
      <DataTable data={data} rowKey="orgId">
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
            const member = Array.isArray(row?.members) && row.members.length > 0 ? row.members[0] : null
            const name = member?.user?.username

            return (
              <Text title={name} truncate>
                {member ? <Link href={`/admin/users/${member.user?.id}`}>{name}</Link> : name}
              </Text>
            )
          }}
        </DataColumn>
        <DataColumn id="created" label={formatMessage(labels.created)} width="160px">
          {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
        </DataColumn>
        {showActions && (
          <DataColumn id="action" align="end" width="50px">
            {(row: any) => {
              const { orgId } = row

              return (
                <MenuButton>
                  <MenuItem href={`/admin/orgs/${orgId}`} data-test="link-button-edit">
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
              )
            }}
          </DataColumn>
        )}
      </DataTable>
      <Modal isOpen={!!deleteUser}></Modal>
    </>
  )
}
