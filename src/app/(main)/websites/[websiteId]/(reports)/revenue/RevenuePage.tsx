'use client';
import { Column } from '@entro314labs/entro-zen';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { useDateRange } from '@/components/hooks';
import { Revenue } from './Revenue';

export function RevenuePage({ websiteId }: { websiteId: string }) {
  const {
    dateRange: { startDate, endDate, unit },
  } = useDateRange();

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <Revenue websiteId={websiteId} startDate={startDate} endDate={endDate} unit={unit} />
    </Column>
  );
}
