import { DataGrid } from '@/components/common/DataGrid';
import { useBoardsQuery, useNavigation } from '@/components/hooks';
import { BoardsTable } from './BoardsTable';

export function BoardsDataTable() {
  const { orgId } = useNavigation();
  const query = useBoardsQuery({ orgId });

  return (
    <DataGrid query={query} allowSearch={true} autoFocus={false} allowPaging={true}>
      {({ data }) => <BoardsTable data={data} />}
    </DataGrid>
  );
}
