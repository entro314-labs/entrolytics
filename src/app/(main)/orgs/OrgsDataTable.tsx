import type { ReactNode } from 'react';
import { DataGrid } from '@/components/common/DataGrid';
import { useLoginQuery, useUserOrgsQuery } from '@/components/hooks';
import { OrgsTable } from './OrgsTable';

export function OrgsDataTable({
  allowEdit,
  showActions,
}: {
  allowEdit?: boolean;
  showActions?: boolean;
  children?: ReactNode;
}) {
  const { user } = useLoginQuery();
  const query = useUserOrgsQuery(user.id);

  return (
    <DataGrid query={query}>
      {({ data }) => {
        return <OrgsTable data={data} allowEdit={allowEdit} showActions={showActions} />;
      }}
    </DataGrid>
  );
}
