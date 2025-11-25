import { getDateSQL, getTimestampDiffSQL, parseFilters, rawQuery } from '@/lib/analytics-utils';
import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE, FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db';

import type { QueryFilters } from '@/lib/types';

export interface EventExpandedMetricParameters {
  type: string;
  limit?: string;
  offset?: string;
}

export interface EventExpandedMetricData {
  name: string;
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

export async function getEventExpandedMetrics(
  ...args: [websiteId: string, parameters: EventExpandedMetricParameters, filters: QueryFilters]
): Promise<EventExpandedMetricData[]> {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: EventExpandedMetricParameters,
  filters: QueryFilters,
) {
  const { type, limit = 500, offset = 0 } = parameters;
  const column = FILTER_COLUMNS[type] || type;
  // Using rawQuery FROM analytics-utils
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters(
    {
      ...filters,
      websiteId,
      eventType: EVENT_TYPE.customEvent,
    },
    { joinSession: SESSION_COLUMNS.includes(type) },
  );

  return rawQuery(
    `
    SELECT
      name,
      SUM(t.c) as "pageviews",
      COUNT(DISTINCT t.session_id) as "visitors",
      COUNT(DISTINCT t.visit_id) as "visits",
      SUM(CASE WHEN t.c = 1 THEN 1 ELSE 0 END) as "bounces",
      SUM(${getTimestampDiffSQL('t.min_time', 't.max_time')}) as "totaltime"
    FROM (
      SELECT
        ${column} name,
        website_event.session_id,
        website_event.visit_id,
        COUNT(*) as "c",
        MIN(website_event.created_at) as "min_time",
        MAX(website_event.created_at) as "max_time"
      FROM website_event
      ${cohortQuery}
      ${joinSessionQuery}
      WHERE website_event.website_id = {{websiteId::uuid}}
        AND website_event.created_at between {{startDate}} AND {{endDate}}
        ${filterQuery}
      GROUP BY name, website_event.session_id, website_event.visit_id
    ) as t
    WHERE name != ''
    GROUP BY name
    ORDER BY visitors desc, visits desc
    limit ${limit}
    offset ${offset}
    `,
    queryParams,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: EventExpandedMetricParameters,
  filters: QueryFilters,
): Promise<EventExpandedMetricData[]> {
  const { type, limit = 500, offset = 0 } = parameters;
  const column = FILTER_COLUMNS[type] || type;
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  return rawQuery(
    `
    SELECT
      name,
      SUM(t.c) as "pageviews",
      uniq(t.session_id) as "visitors",
      uniq(t.visit_id) as "visits",
      SUM(if(t.c = 1, 1, 0)) as "bounces",
      SUM(max_time-min_time) as "totaltime"
    FROM (
      SELECT
        ${column} name,
        session_id,
        visit_id,
        COUNT(*) c,
        MIN(created_at) min_time,
        MAX(created_at) max_time
      FROM website_event
      ${cohortQuery}
      WHERE website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
        AND name != ''
        ${filterQuery}
      GROUP BY name, session_id, visit_id
    ) as t
    GROUP BY name 
    ORDER BY visitors desc, visits desc
    limit ${limit}
    offset ${offset}
    `,
    { ...queryParams, ...parameters },
  );
}
