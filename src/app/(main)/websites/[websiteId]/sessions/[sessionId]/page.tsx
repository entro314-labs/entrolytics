import type { Metadata } from 'next';
import { SessionDetailsPage } from './SessionDetailsPage';

export default async function WebsitePage({
  params,
}: {
  params: Promise<{ websiteId: string; sessionId: string }>;
}) {
  const { websiteId, sessionId } = await params;

  return <SessionDetailsPage websiteId={websiteId} sessionId={sessionId} />;
}

export const metadata: Metadata = {
  title: 'Websites',
};
