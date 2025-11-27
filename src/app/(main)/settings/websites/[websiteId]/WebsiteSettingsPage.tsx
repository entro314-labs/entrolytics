'use client';
import { Column } from '@entro314labs/entro-zen';
import { WebsiteSettings } from '@/app/(main)/websites/[websiteId]/settings/WebsiteSettings';
import { WebsiteSettingsHeader } from '@/app/(main)/websites/[websiteId]/settings/WebsiteSettingsHeader';
import { WebsiteProvider } from '@/app/(main)/websites/WebsiteProvider';

export function WebsiteSettingsPage({ websiteId }: { websiteId: string }) {
  return (
    <WebsiteProvider websiteId={websiteId}>
      <Column gap="6">
        <WebsiteSettingsHeader />
        <WebsiteSettings websiteId={websiteId} />
      </Column>
    </WebsiteProvider>
  );
}
