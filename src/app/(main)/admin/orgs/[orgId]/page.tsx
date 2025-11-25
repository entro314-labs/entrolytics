import type { Metadata } from 'next';
import { AdminOrgPage } from './AdminOrgPage';

export default async function ({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;

  return <AdminOrgPage orgId={orgId} />;
}

export const metadata: Metadata = {
  title: 'Org',
};
