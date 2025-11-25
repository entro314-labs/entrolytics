import { getDateSQL, getTimestampDiffSQL, parseFilters, rawQuery } from '@/lib/analytics-utils';
import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db';
import type { QueryFilters } from '@/lib/types';

export async function getSessionDataProperties(
  ...args: [websiteId: string, filters: QueryFilters & { propertyName?: string }]
) {
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
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters(
    { ...filters, websiteId },
    {
      columns: { propertyName: 'data_key' },
    },
  );

  return rawQuery(
    `
    SELECT
        data_key as "propertyName",
        COUNT(DISTINCT session_data.session_id) as "total"
    FROM website_event 
    ${cohortQuery}
    ${joinSessionQuery}
    JOIN session_data
        on session_data.session_id = website_event.session_id
          AND session_data.website_id = website_event.website_id
    WHERE website_event.website_id = {{websiteId::uuid}}
      AND website_event.created_at between {{startDate}} AND {{endDate}}
        ${filterQuery}
    GROUP BY 1
    ORDER BY 2 desc
    limit 500
    `,
    queryParams,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters & { propertyName?: string },
): Promise<{ propertyName: string; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters(
    { ...filters, websiteId },
    {
      columns: { propertyName: 'data_key' },
    },
  );

  return rawQuery(
    `
    SELECT
      data_key as propertyName,
      COUNT(DISTINCT session_data.session_id) as total
    FROM website_event
    ${cohortQuery}
    JOIN session_data final
      on session_data.session_id = website_event.session_id
    WHERE website_event.website_id = {websiteId:UUID}
      AND website_event.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
      AND session_data.data_key != ''
    ${filterQuery}
    GROUP BY 1
    ORDER BY 2 desc
    limit 500
    `,
    queryParams,
  );
}
