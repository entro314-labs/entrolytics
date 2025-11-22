import { useLinksQuery, useNavigation } from '@/components/hooks'
import { LinksTable } from './LinksTable'
import { DataGrid } from '@/components/common/DataGrid'

export function LinksDataTable() {
  const { orgId } = useNavigation()
  const query = useLinksQuery({ orgId })

  return (
    <DataGrid query={query} allowSearch={true} autoFocus={false} allowPaging={true}>
      {({ data }) => <LinksTable data={data} />}
    </DataGrid>
  )
}
