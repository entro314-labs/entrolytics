import { getDateSQL, getTimestampDiffSQL, parseFilters, rawQuery } from '@/lib/analytics-utils';
import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db';
import type { QueryFilters } from '@/lib/types';

interface WebsiteEventData {
  value: string;
  total: number;
}

export async function getEventDataValues(
  ...args: [websiteId: string, filters: QueryFilters & { propertyName?: string }]
): Promise<WebsiteEventData[]> {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters & { propertyName?: string },
) {
  // Using rawQuery FROM analytics-utils
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  return rawQuery(
    `
    SELECT
      CASE
        WHEN data_type = 2 THEN replace(string_value, '.0000', '')
        WHEN data_type = 4 THEN ${getDateSQL('date_value', 'hour', 'UTC')}
        ELSE string_value
      END as "value",
      COUNT(*) as "total"
    FROM event_data
    JOIN website_event on website_event.event_id = event_data.website_event_id
      AND website_event.website_id = {{websiteId::uuid}}
      AND website_event.created_at between {{startDate}} AND {{endDate}}
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE event_data.website_id = {{websiteId::uuid}}
      AND event_data.created_at between {{startDate}} AND {{endDate}}
      AND event_data.data_key = {{propertyName}}
    ${filterQuery}
    GROUP BY value
    ORDER BY 2 desc
    limit 100
    `,
    queryParams,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters & { propertyName?: string },
): Promise<{ value: string; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId });

  return rawQuery(
    `
    SELECT
      multiIf(data_type = 2, replaceAll(string_value, '.0000', ''),
              data_type = 4, toString(date_trunc('hour', date_value)),
              string_value) as "value",
      COUNT(*) as "total"
    FROM event_data
    join website_event
    on website_event.event_id = event_data.event_id
      and website_event.website_id = event_data.website_id
      and website_event.website_id = {websiteId:UUID}
      and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ${cohortQuery}
    where event_data.website_id = {websiteId:UUID}
      and event_data.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_data.data_key = {propertyName:String}
      and event_data.event_name = {event:String}
    ${filterQuery}
    group by value
    order by 2 desc
    limit 100
    `,
    queryParams,
  );
}
