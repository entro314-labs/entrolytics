import { Metadata } from 'next';
import { OrgSettingsPage } from './OrgSettingsPage';

export default async function ({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;

  return <OrgSettingsPage orgId={orgId} />;
}

export const metadata: Metadata = {
  title: 'Orgs',
};
