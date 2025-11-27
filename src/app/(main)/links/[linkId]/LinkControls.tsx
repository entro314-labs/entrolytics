import { Column, Row } from '@entro314labs/entro-zen';
import { ExportButton } from '@/components/input/ExportButton';
import { FilterBar } from '@/components/input/FilterBar';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { WebsiteFilterButton } from '@/components/input/WebsiteFilterButton';
import { MonthFilter } from '@/components/input/MonthFilter';

export function LinkControls({
  linkId: websiteId,
  allowFilter = true,
  allowDateFilter = true,
  allowMonthFilter,
  allowDownload = false,
}: {
  linkId: string;
  allowFilter?: boolean;
  allowDateFilter?: boolean;
  allowMonthFilter?: boolean;
  allowDownload?: boolean;
}) {
  return (
    <Column gap>
      <Row alignItems="center" justifyContent="space-between" gap="3">
        {allowFilter ? <WebsiteFilterButton websiteId={websiteId} /> : <div />}
        {allowDateFilter && <WebsiteDateFilter websiteId={websiteId} showAllTime={false} />}
        {allowDownload && <ExportButton websiteId={websiteId} />}
        {allowMonthFilter && <MonthFilter websiteId={websiteId} />}
      </Row>
      {allowFilter && <FilterBar websiteId={websiteId} />}
    </Column>
  );
}
