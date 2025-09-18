import clickhouse from '@/lib/clickhouse'
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db'
import { getTimestampDiffSQL, getDateSQL, parseFilters, rawQuery } from '@/lib/analytics-utils'
import { QueryFilters } from '@/lib/types'

export async function getEventDataStats(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<{
  events: number
  properties: number
  records: number
}> {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  }).then((results) => results?.[0])
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  // Using rawQuery FROM analytics-utils
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  })

  return rawQuery(
    `
    SELECT 
      COUNT(DISTINCT t.website_event_id) as "events",
      COUNT(DISTINCT t.data_key) as "properties",
      SUM(t.total) as "records"
    FROM (
      SELECT
        website_event_id,
        data_key,
        COUNT(*) as "total"
      FROM event_data
      JOIN website_event on website_event.event_id = event_data.website_event_id
        AND website_event.website_id = {{websiteId::uuid}}
        AND website_event.created_at between {{startDate}} AND {{endDate}}
      ${cohortQuery}
      ${joinSessionQuery}
      WHERE event_data.website_id = {{websiteId::uuid}}
        AND event_data.created_at between {{startDate}} AND {{endDate}}
      ${filterQuery}
      GROUP BY website_event_id, data_key
      ) as t
    `,
    queryParams
  )
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters
): Promise<{ events: number; properties: number; records: number }[]> {
  const { rawQuery, parseFilters } = clickhouse
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId })

  return rawQuery(
    `
    SELECT 
      COUNT(DISTINCT t.event_id) as "events",
      COUNT(DISTINCT t.data_key) as "properties",
      SUM(t.total) as "records"
    FROM (
      SELECT
        event_id,
        data_key,
        COUNT(*) as "total"
      FROM event_data website_event
      ${cohortQuery}
      WHERE website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
      ${filterQuery}
      GROUP BY event_id, data_key
      ) as t
    `,
    queryParams
  )
}
