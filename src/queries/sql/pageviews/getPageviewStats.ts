import clickhouse from '@/lib/clickhouse'
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db'
import { getTimestampDiffSQL, getDateSQL, parseFilters, rawQuery } from '@/lib/analytics-utils'

import { EVENT_COLUMNS, EVENT_TYPE } from '@/lib/constants'
import { QueryFilters } from '@/lib/types'

export async function getPageviewStats(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  })
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { timezone = 'utc', unit = 'day' } = filters
  // Using rawQuery FROM analytics-utils
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    eventType: EVENT_TYPE.pageView,
  })

  return rawQuery(
    `
    SELECT
      ${getDateSQL('website_event.created_at', unit, timezone)} x,
      COUNT(*) y
    FROM website_event
    ${cohortQuery}
    ${joinSessionQuery}  
    WHERE website_event.website_id = {{websiteId::uuid}}
      AND website_event.created_at between {{startDate}} AND {{endDate}}
      ${filterQuery}
    GROUP BY 1
    ORDER BY 1
    `,
    queryParams
  )
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters
): Promise<{ x: string; y: number }[]> {
  const { timezone = 'utc', unit = 'day' } = filters
  const { parseFilters, rawQuery, getDateSQL } = clickhouse
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    eventType: EVENT_TYPE.pageView,
  })

  let sql = ''

  if ((filters && typeof filters === 'object' && EVENT_COLUMNS.some((item) => Object.keys(filters).includes(item))) || unit === 'minute') {
    sql = `
    SELECT
      g.t as x,
      g.y as y
    FROM (
      SELECT
        ${getDateSQL('website_event.created_at', unit, timezone)} as t,
        COUNT(*) as y
      FROM website_event
      ${cohortQuery}
      WHERE website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
        ${filterQuery}
      GROUP BY t
    ) as g
    ORDER BY t
    `
  } else {
    sql = `
    SELECT
      g.t as x,
      g.y as y
    FROM (
      SELECT
        ${getDateSQL('website_event.created_at', unit, timezone)} as t,
        SUM(views) as y
      FROM website_event_stats_hourly as website_event
      ${cohortQuery}
      WHERE website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
        ${filterQuery}
      GROUP BY t
    ) as g
    ORDER BY t
    `
  }

  return rawQuery(sql, queryParams)
}
