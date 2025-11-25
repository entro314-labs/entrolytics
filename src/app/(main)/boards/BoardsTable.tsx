import { DataColumn, DataTable, type DataTableProps, Row } from '@entro314labs/entro-zen';
import Link from 'next/link';
import { DateDistance } from '@/components/common/DateDistance';
import { useMessages, useNavigation } from '@/components/hooks';
import { BoardDeleteButton } from './BoardDeleteButton';
import { BoardEditButton } from './BoardEditButton';

export function BoardsTable(props: DataTableProps) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <DataTable {...props} rowKey={(row, index) => row?.boardId || `board-${index}`}>
      <DataColumn id="name" label={formatMessage(labels.name)}>
        {({ boardId, name }: any) => {
          return <Link href={renderUrl(`/boards/${boardId}`)}>{name}</Link>;
        }}
      </DataColumn>
      <DataColumn id="description" label={formatMessage(labels.description)}>
        {({ description }: any) => {
          return description || '-';
        }}
      </DataColumn>
      <DataColumn id="created" label={formatMessage(labels.created)} width="200px">
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
      <DataColumn id="action" align="end" width="100px">
        {({ boardId, name }: any) => {
          return (
            <Row>
              <BoardEditButton boardId={boardId} />
              <BoardDeleteButton boardId={boardId} name={name} />
            </Row>
          );
        }}
      </DataColumn>
    </DataTable>
  );
}
