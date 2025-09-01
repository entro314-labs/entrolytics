'use client';
import { OrgsDataTable } from '@/app/(main)/orgs/OrgsDataTable';
import { OrgsHeader } from '@/app/(main)/orgs/OrgsHeader';
import { Column } from '@entro314labs/entro-zen';
import { Panel } from '@/components/common/Panel';
import { PageBody } from '@/components/common/PageBody';

export function OrgsPage() {
  return (
    <PageBody>
      <Column gap="6">
        <OrgsHeader />
        <Panel>
          <OrgsDataTable />
        </Panel>
      </Column>
    </PageBody>
  );
}
