import { getDateSQL, parseFilters, rawQuery } from '@/lib/analytics-utils';
import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getEventStats';

interface WebsiteEventMetric {
  x: string;
  t: string;
  y: number;
}

export async function getEventStats(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<WebsiteEventMetric[]> {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { timezone = 'utc', unit = 'day' } = filters;
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    eventType: EVENT_TYPE.customEvent,
  });

  return rawQuery(
    `
    SELECT
      event_name x,
      ${getDateSQL('website_event.created_at', unit, timezone)} t,
      COUNT(*) y
    FROM website_event
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE website_event.website_id = {{websiteId::uuid}}
      AND website_event.created_at BETWEEN {{startDate}} AND {{endDate}}
      ${filterQuery}
    GROUP BY 1, 2
    ORDER BY 2
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<{ x: string; t: string; y: number }[]> {
  const { timezone = 'UTC', unit = 'day' } = filters;
  const { rawQuery, getDateSQL, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    eventType: EVENT_TYPE.customEvent,
  });

  let sql = '';

  if (filterQuery || cohortQuery) {
    sql = `
    select
      event_name x,
      ${getDateSQL('created_at', unit, timezone)} t,
      count(*) y
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${filterQuery}
    group by x, t
    order by t
    `;
  } else {
    sql = `
    select
      event_name x,
      ${getDateSQL('created_at', unit, timezone)} t,
      count(*) y
    from (
      select arrayJoin(event_name) as event_name,
        created_at
      from website_event_stats_hourly website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = {eventType:UInt32}
    ) as g
    group by x, t
    order by t
    `;
  }

  return rawQuery(sql, queryParams, FUNCTION_NAME);
}
