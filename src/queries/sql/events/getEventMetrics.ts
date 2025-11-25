import { getDateSQL, getTimestampDiffSQL, parseFilters, rawQuery } from '@/lib/analytics-utils';
import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE, FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db';

import type { QueryFilters } from '@/lib/types';

export interface EventMetricParameters {
  type: string;
  limit?: string;
  offset?: string;
}

export interface EventMetricData {
  x: string;
  t: string;
  y: number;
}

export async function getEventMetrics(
  ...args: [websiteId: string, parameters: EventMetricParameters, filters: QueryFilters]
): Promise<EventMetricData[]> {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: EventMetricParameters,
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
    SELECT ${column} x,
      COUNT(*) as y
    FROM website_event
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE website_event.website_id = {{websiteId::uuid}}
      AND website_event.created_at between {{startDate}} AND {{endDate}}
      ${filterQuery}
    GROUP BY 1
    ORDER BY 2 desc
    limit ${limit}
    offset ${offset}
    `,
    { ...queryParams, ...parameters },
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: EventMetricParameters,
  filters: QueryFilters,
): Promise<EventMetricData[]> {
  const { type, limit = 500, offset = 0 } = parameters;
  const column = FILTER_COLUMNS[type] || type;
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    eventType: EVENT_TYPE.customEvent,
  });

  return rawQuery(
    `SELECT ${column} x,
            COUNT(*) as y
     FROM website_event
      ${cohortQuery}
     WHERE website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
        ${filterQuery}
     GROUP BY x
     ORDER BY y desc
         limit ${limit}
     offset ${offset}
    `,
    { ...queryParams, ...parameters },
  );
}
