import { Column, Grid, Row } from '@entro314labs/entro-zen';
import { ExportButton } from '@/components/input/ExportButton';
import { FilterBar } from '@/components/input/FilterBar';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { WebsiteFilterButton } from '@/components/input/WebsiteFilterButton';
import { MonthFilter } from '@/components/input/MonthFilter';

export function WebsiteControls({
  websiteId,
  allowFilter = true,
  allowDateFilter = true,
  allowMonthFilter,
  allowDownload = false,
  allowCompare = false,
}: {
  websiteId: string;
  allowFilter?: boolean;
  allowDateFilter?: boolean;
  allowMonthFilter?: boolean;
  allowDownload?: boolean;
  allowCompare?: boolean;
}) {
  return (
    <Column gap>
      <Grid columns={{ xs: '1fr', md: 'auto 1fr' }} gap>
        <Row alignItems="center" justifyContent="flex-end">
          {allowFilter ? <WebsiteFilterButton websiteId={websiteId} /> : <div />}
        </Row>
        <Row alignItems="center" justifyContent="flex-end">
          {allowDateFilter && (
            <WebsiteDateFilter websiteId={websiteId} allowCompare={allowCompare} />
          )}
          {allowDownload && <ExportButton websiteId={websiteId} />}
          {allowMonthFilter && <MonthFilter websiteId={websiteId} />}
        </Row>
      </Grid>
      {allowFilter && <FilterBar websiteId={websiteId} />}
    </Column>
  );
}
