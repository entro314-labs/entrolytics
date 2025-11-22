import { DataGrid } from '@/components/common/DataGrid'
import { useOrgWebsitesQuery } from '@/components/hooks'
import { OrgWebsitesTable } from './OrgWebsitesTable'

export function OrgWebsitesDataTable({
  orgId,
  allowEdit = false,
}: {
  orgId: string
  allowEdit?: boolean
}) {
  const queryResult = useOrgWebsitesQuery(orgId)

  return (
    <DataGrid query={queryResult} allowSearch>
      {({ data }) => <OrgWebsitesTable data={data} orgId={orgId} allowEdit={allowEdit} />}
    </DataGrid>
  )
}
