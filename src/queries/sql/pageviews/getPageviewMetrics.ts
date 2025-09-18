import clickhouse from '@/lib/clickhouse'
import { EVENT_COLUMNS, EVENT_TYPE, FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants'
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db'
import { getTimestampDiffSQL, getDateSQL, parseFilters, rawQuery } from '@/lib/analytics-utils'

import { QueryFilters } from '@/lib/types'

export interface PageviewMetricsParameters {
  type: string
  limit?: number | string
  offset?: number | string
}

export interface PageviewMetricsData {
  x: string
  y: number
}

export async function getPageviewMetrics(
  ...args: [websiteId: string, parameters: PageviewMetricsParameters, filters: QueryFilters]
) {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  })
}

async function relationalQuery(
  websiteId: string,
  parameters: PageviewMetricsParameters,
  filters: QueryFilters
): Promise<PageviewMetricsData[]> {
  const { type, limit = 500, offset = 0 } = parameters
  let column = FILTER_COLUMNS[type] || type
  // Using rawQuery FROM analytics-utils
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters(
    {
      ...filters,
      websiteId,
      eventType: column === 'event_name' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
    },
    { joinSession: SESSION_COLUMNS.includes(type) }
  )

  let entryExitQuery = ''
  let excludeDomain = ''

  if (column === 'referrer_domain') {
    excludeDomain = `AND website_event.referrer_domain != website_event.hostname
      AND website_event.referrer_domain != ''`
  }

  if (type === 'entry' || type === 'exit') {
    const order = type === 'entry' ? 'asc' : 'desc'
    column = `x.${column}`

    entryExitQuery = `
      JOIN (
        SELECT DISTINCT on (visit_id)
          visit_id,
          url_path
        FROM website_event
        WHERE website_event.website_id = {{websiteId::uuid}}
          AND website_event.created_at between {{startDate}} AND {{endDate}}
          AND event_type = {{eventType}}
        ORDER BY visit_id, created_at ${order}
      ) x
      on x.visit_id = website_event.visit_id
    `
  }

  return rawQuery(
    `
    SELECT ${column} x,
      COUNT(DISTINCT website_event.session_id) as y
    FROM website_event
    ${cohortQuery}
    ${joinSessionQuery}
    ${entryExitQuery}
    WHERE website_event.website_id = {{websiteId::uuid}}
      AND website_event.created_at between {{startDate}} AND {{endDate}}
      ${excludeDomain}
      ${filterQuery}
    GROUP BY 1
    ORDER BY 2 desc
    limit ${limit}
    offset ${offset}
    `,
    { ...queryParams, ...parameters }
  )
}

async function clickhouseQuery(
  websiteId: string,
  parameters: PageviewMetricsParameters,
  filters: QueryFilters
): Promise<{ x: string; y: number }[]> {
  const { type, limit = 500, offset = 0 } = parameters
  let column = FILTER_COLUMNS[type] || type
  const { rawQuery, parseFilters } = clickhouse
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    eventType: column === 'event_name' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
  })

  let sql = ''
  let excludeDomain = ''

  if (EVENT_COLUMNS.some((item) => Object.keys(filters).includes(item))) {
    let entryExitQuery = ''

    if (column === 'referrer_domain') {
      excludeDomain = `AND referrer_domain != hostname AND referrer_domain != ''`
    }

    if (type === 'entry' || type === 'exit') {
      const aggregrate = type === 'entry' ? 'argMin' : 'argMax'
      column = `x.${column}`

      entryExitQuery = `
      JOIN (SELECT visit_id,
          ${aggregrate}(url_path, created_at) url_path
      FROM website_event
      WHERE website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
        AND event_type = {eventType:UInt32}
      GROUP BY visit_id) x
      ON x.visit_id = website_event.visit_id`
    }

    sql = `
    SELECT ${column} x, 
      uniq(website_event.session_id) as y
    FROM website_event
    ${cohortQuery}
    ${entryExitQuery}
    WHERE website_id = {websiteId:UUID}
      AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
      ${excludeDomain}
      ${filterQuery}
    GROUP BY x
    ORDER BY y desc
    limit ${limit}
    offset ${offset}
    `
  } else {
    let groupByQuery = ''
    let columnQuery = `arrayJoin(${column})`

    if (column === 'referrer_domain') {
      excludeDomain = `AND t != ''`
    }

    if (type === 'entry') {
      columnQuery = `argMinMerge(entry_url)`
    }

    if (type === 'exit') {
      columnQuery = `argMaxMerge(exit_url)`
    }

    if (type === 'entry' || type === 'exit') {
      groupByQuery = 'GROUP BY s'
    }

    sql = `
    SELECT g.t as x,
      uniq(s) as y
    FROM (
      SELECT session_id s, 
        ${columnQuery} as t
      FROM website_event_stats_hourly as website_event
      ${cohortQuery}
      WHERE website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
        ${excludeDomain}
        ${filterQuery}
      ${groupByQuery}) as g
    GROUP BY x
    ORDER BY y desc
    limit ${limit}
    offset ${offset}
    `
  }

  return rawQuery(sql, { ...queryParams, ...parameters })
}
