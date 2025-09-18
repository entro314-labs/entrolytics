import clickhouse from '@/lib/clickhouse'
import { EVENT_COLUMNS, EVENT_TYPE, FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants'
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db'
import { getTimestampDiffSQL, getDateSQL, parseFilters, rawQuery } from '@/lib/analytics-utils'

import { QueryFilters } from '@/lib/types'

export interface SessionMetricsParameters {
  type: string
  limit?: number | string
  offset?: number | string
}

export async function getSessionMetrics(
  ...args: [websiteId: string, parameters: SessionMetricsParameters, filters: QueryFilters]
) {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  })
}

async function relationalQuery(
  websiteId: string,
  parameters: SessionMetricsParameters,
  filters: QueryFilters
) {
  const { type, limit = 500, offset = 0 } = parameters
  let column = FILTER_COLUMNS[type] || type
  // Using rawQuery FROM analytics-utils
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters(
    {
      ...filters,
      websiteId,
      eventType: EVENT_TYPE.pageView,
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
  parameters: SessionMetricsParameters,
  filters: QueryFilters
): Promise<{ x: string; y: number }[]> {
  const { type, limit = 500, offset = 0 } = parameters
  let column = FILTER_COLUMNS[type] || type
  const { parseFilters, rawQuery } = clickhouse
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    eventType: EVENT_TYPE.pageView,
  })
  const includeCountry = column === 'city' || column === 'region'

  if (type === 'language') {
    column = `lower(left(${type}, 2))`
  }

  let sql = ''

  if (filters && typeof filters === 'object' && EVENT_COLUMNS.some((item) => Object.keys(filters).includes(item))) {
    sql = `
    SELECT
      ${column} x,
      COUNT(DISTINCT session_id) y
      ${includeCountry ? ', country' : ''}
    FROM website_event
    ${cohortQuery}
    WHERE website_id = {websiteId:UUID}
      AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
      ${filterQuery}
    GROUP BY x 
    ${includeCountry ? ', country' : ''}
    ORDER BY y desc
    limit ${limit}
    offset ${offset}
    `
  } else {
    sql = `
    SELECT
      ${column} x,
      uniq(session_id) y
      ${includeCountry ? ', country' : ''}
    FROM website_event_stats_hourly as website_event
    ${cohortQuery}
    WHERE website_id = {websiteId:UUID}
      AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
      ${filterQuery}
    GROUP BY x 
    ${includeCountry ? ', country' : ''}
    ORDER BY y desc
    limit ${limit}
    offset ${offset}
    `
  }

  return rawQuery(sql, { ...queryParams, ...parameters })
}
