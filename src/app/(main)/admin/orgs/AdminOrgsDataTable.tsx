import { DataGrid } from '@/components/common/DataGrid';
import { useOrgsQuery } from '@/components/hooks';
import { AdminOrgsTable } from './AdminOrgsTable';
import { ReactNode } from 'react';

export function AdminOrgsDataTable({
  showActions,
}: {
  showActions?: boolean;
  children?: ReactNode;
}) {
  const queryResult = useOrgsQuery();

  return (
    <DataGrid query={queryResult} allowSearch={true}>
      {({ data }) => <AdminOrgsTable data={data} showActions={showActions} />}
    </DataGrid>
  );
}
