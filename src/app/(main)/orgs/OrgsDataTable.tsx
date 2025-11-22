import { DataGrid } from '@/components/common/DataGrid'
import { OrgsTable } from './OrgsTable'
import { useLoginQuery, useUserOrgsQuery } from '@/components/hooks'
import { ReactNode } from 'react'

export function OrgsDataTable({
  allowEdit,
  showActions,
}: {
  allowEdit?: boolean
  showActions?: boolean
  children?: ReactNode
}) {
  const { user } = useLoginQuery()
  const query = useUserOrgsQuery(user.id)

  return (
    <DataGrid query={query}>
      {({ data }) => {
        return <OrgsTable data={data} allowEdit={allowEdit} showActions={showActions} />
      }}
    </DataGrid>
  )
}
