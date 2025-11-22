import clickhouse from '@/lib/clickhouse'
import { EVENT_TYPE, FILTER_COLUMNS, GROUPED_DOMAINS, SESSION_COLUMNS } from '@/lib/constants'
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db'
import { getTimestampDiffSQL, getDateSQL, parseFilters, rawQuery } from '@/lib/analytics-utils'

import { QueryFilters } from '@/lib/types'

export interface PageviewExpandedMetricsParameters {
  type: string
  limit?: number | string
  offset?: number | string
}

export interface PageviewExpandedMetricsData {
  name: string
  pageviews: number
  visitors: number
  visits: number
  bounces: number
  totaltime: number
}

export async function getPageviewExpandedMetrics(
  ...args: [websiteId: string, parameters: PageviewExpandedMetricsParameters, filters: QueryFilters]
) {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  })
}

async function relationalQuery(
  websiteId: string,
  parameters: PageviewExpandedMetricsParameters,
  filters: QueryFilters
): Promise<PageviewExpandedMetricsData[]> {
  const { type, limit = 500, offset = 0 } = parameters
  const column = FILTER_COLUMNS[type] || type
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
    const aggregrate = type === 'entry' ? 'MIN' : 'MAX'

    entryExitQuery = `
      JOIN (
        SELECT visit_id,
            ${aggregrate}(created_at) target_created_at
        FROM website_event
        WHERE website_event.website_id = {{websiteId::uuid}}
          AND website_event.created_at between {{startDate}} AND {{endDate}}
          AND event_type = {{eventType}}
        GROUP BY visit_id
      ) x
      on x.visit_id = website_event.visit_id
          AND x.target_created_at = website_event.created_at
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
    HAVING ${column} != ''
    ORDER BY 2 desc
    limit ${limit}
    offset ${offset}
    `,
    queryParams
  )
}

async function clickhouseQuery(
  websiteId: string,
  parameters: PageviewExpandedMetricsParameters,
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

  let excludeDomain = ''
  let entryExitQuery = ''

  if (column === 'referrer_domain') {
    excludeDomain = `AND referrer_domain != hostname AND referrer_domain != ''`
    if (type === 'domain') {
      column = toClickHouseGroupedReferrer(GROUPED_DOMAINS)
    }
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
      ${entryExitQuery}
      WHERE website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
        AND name != ''
        ${excludeDomain}
        ${filterQuery}
      GROUP BY name, session_id, visit_id
    ) as t
    GROUP BY name 
    ORDER BY visitors desc, visits desc
    limit ${limit}
    offset ${offset}
    `,
    { ...queryParams, ...parameters }
  )
}

export function toClickHouseGroupedReferrer(
  domains: any[],
  column: string = 'referrer_domain'
): string {
  return [
    'CASE',
    ...domains.map((group) => {
      const matches = Array.isArray(group.match) ? group.match : [group.match]
      const formattedArray = matches.map((m) => `'${m}'`).join(', ')
      return `  WHEN multiSearchAny(${column}, [${formattedArray}]) != 0 THEN '${group.domain}'`
    }),
    "  ELSE 'Other'",
    'END',
  ].join('\n')
}
