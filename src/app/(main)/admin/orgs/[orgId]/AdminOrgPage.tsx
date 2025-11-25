'use client';
import { OrgSettings } from '@/app/(main)/orgs/[orgId]/OrgSettings';
import { OrgProvider } from '@/app/(main)/orgs/OrgProvider';

export function AdminOrgPage({ orgId }: { orgId: string }) {
  return (
    <OrgProvider orgId={orgId}>
      <OrgSettings orgId={orgId} />
    </OrgProvider>
  );
}
