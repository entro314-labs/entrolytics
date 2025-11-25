'use client';
import { Grid } from '@entro314labs/entro-zen';
import { firstBy } from 'thenby';
import { GridRow } from '@/components/common/GridRow';
import { PageBody } from '@/components/common/PageBody';
import { Panel } from '@/components/common/Panel';
import { useRealtimeQuery } from '@/components/hooks';
import { RealtimeChart } from '@/components/metrics/RealtimeChart';
import { WorldMap } from '@/components/metrics/WorldMap';
import { percentFilter } from '@/lib/filters';
import { RealtimeCountries } from './RealtimeCountries';
import { RealtimeHeader } from './RealtimeHeader';
import { RealtimeLog } from './RealtimeLog';
import { RealtimeUrls } from './RealtimeUrls';

export function RealtimePage({ websiteId }: { websiteId: string }) {
  const { data, isLoading, error } = useRealtimeQuery(websiteId);

  if (isLoading || error) {
    return <PageBody isLoading={isLoading} error={error} />;
  }

  const countries = percentFilter(
    Object.keys(data.countries)
      .map(key => ({ x: key, y: data.countries[key] }))
      .sort(firstBy('y', -1)),
  );

  return (
    <Grid gap="3">
      <RealtimeHeader data={data} />
      <Panel>
        <RealtimeChart data={data} unit="minute" />
      </Panel>
      <GridRow layout="two">
        <Panel>
          <RealtimeUrls data={data} />
        </Panel>
        <Panel>
          <RealtimeLog data={data} />
        </Panel>
      </GridRow>
      <GridRow layout="one-two">
        <Panel>
          <RealtimeCountries data={countries} />
        </Panel>
        <Panel gridColumn="span 2" padding="0">
          <WorldMap data={countries} />
        </Panel>
      </GridRow>
    </Grid>
  );
}
