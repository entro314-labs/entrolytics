import clickhouse from '@/lib/clickhouse'
import { FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants'
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db'
import { getTimestampDiffSQL, getDateSQL, parseFilters, rawQuery } from '@/lib/analytics-utils'

import { QueryFilters } from '@/lib/types'

export interface SessionExpandedMetricsParameters {
  type: string
  limit?: number | string
  offset?: number | string
}

export interface SessionExpandedMetricsData {
  name: string
  pageviews: number
  visitors: number
  visits: number
  bounces: number
  totaltime: number
}

export async function getSessionExpandedMetrics(
  ...args: [websiteId: string, parameters: SessionExpandedMetricsParameters, filters: QueryFilters]
): Promise<SessionExpandedMetricsData[]> {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  })
}

async function relationalQuery(
  websiteId: string,
  parameters: SessionExpandedMetricsParameters,
  filters: QueryFilters
): Promise<SessionExpandedMetricsData[]> {
  const { type, limit = 500, offset = 0 } = parameters
  let column = FILTER_COLUMNS[type] || type
  // Using rawQuery FROM analytics-utils
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters(
    {
      ...filters,
      websiteId,
    },
    {
      joinSession: SESSION_COLUMNS.includes(type),
    }
  )
  const includeCountry = column === 'city' || column === 'region'

  if (type === 'language') {
    column = `lower(left(${type}, 2))`
  }

  return rawQuery(
    `
    SELECT 
      ${column} x,
      COUNT(DISTINCT website_event.session_id) y
      ${includeCountry ? ', country' : ''}
    FROM website_event
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE website_event.website_id = {{websiteId::uuid}}
      AND website_event.created_at between {{startDate}} AND {{endDate}}
      AND website_event.event_type != 2
    ${filterQuery}
    GROUP BY 1 
    ${includeCountry ? ', 3' : ''}
    ORDER BY 2 desc
    limit ${limit}
    offset ${offset}
    `,
    { ...queryParams, ...parameters }
  )
}

async function clickhouseQuery(
  websiteId: string,
  parameters: SessionExpandedMetricsParameters,
  filters: QueryFilters
): Promise<SessionExpandedMetricsData[]> {
  const { type, limit = 500, offset = 0 } = parameters
  let column = FILTER_COLUMNS[type] || type
  const { parseFilters, rawQuery } = clickhouse
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  })
  const includeCountry = column === 'city' || column === 'region'

  if (type === 'language') {
    column = `lower(left(${type}, 2))`
  }

  return rawQuery(
    `
    SELECT
      name,
      ${includeCountry ? 'country,' : ''}
      SUM(t.c) as "pageviews",
      uniq(t.session_id) as "visitors",
      uniq(t.visit_id) as "visits",
      SUM(if(t.c = 1, 1, 0)) as "bounces",
      SUM(max_time-min_time) as "totaltime"
    FROM (
      SELECT
        ${column} name,
        ${includeCountry ? 'country,' : ''}
        session_id,
        visit_id,
        COUNT(*) c,
        MIN(created_at) min_time,
        MAX(created_at) max_time
      FROM website_event
      ${cohortQuery}
      WHERE website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
        AND event_type != 2
        AND name != ''
        ${filterQuery}
      GROUP BY name, session_id, visit_id
      ${includeCountry ? ', country' : ''}
    ) as t
    GROUP BY name 
    ${includeCountry ? ', country' : ''}
    ORDER BY visitors desc, visits desc
    limit ${limit}
    offset ${offset}
    `,
    { ...queryParams, ...parameters }
  )
}
