import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db'
import { getTimestampDiffSQL, getDateSQL, parseFilters, rawQuery } from '@/lib/analytics-utils'

import clickhouse from '@/lib/clickhouse'
import { EVENT_TYPE, FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants'
import { QueryFilters } from '@/lib/types'

export interface BreakdownParameters {
  startDate: Date
  endDate: Date
  fields: string[]
}

export interface BreakdownData {
  x: string
  y: number
}

export async function getBreakdown(
  ...args: [websiteId: string, parameters: BreakdownParameters, filters: QueryFilters]
) {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  })
}

async function relationalQuery(
  websiteId: string,
  parameters: BreakdownParameters,
  filters: QueryFilters
): Promise<BreakdownData[]> {
  // Using rawQuery FROM analytics-utils
  const { startDate, endDate, fields } = parameters
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters(
    {
      ...filters,
      websiteId,
      startDate,
      endDate,
      eventType: EVENT_TYPE.pageView,
    },
    {
      joinSession: !!fields.find((name: string) => SESSION_COLUMNS.includes(name)),
    }
  )

  return rawQuery(
    `
    SELECT
      SUM(t.c) as "views",
      COUNT(DISTINCT t.session_id) as "visitors",
      COUNT(DISTINCT t.visit_id) as "visits",
      SUM(CASE WHEN t.c = 1 THEN 1 ELSE 0 END) as "bounces",
      SUM(${getTimestampDiffSQL('t.min_time', 't.max_time')}) as "totaltime",
      ${parseFieldsByName(fields)}
    FROM (
      SELECT
        ${parseFields(fields)},
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
      GROUP BY ${parseFieldsByName(fields)}, 
        website_event.session_id, website_event.visit_id
    ) as t
    GROUP BY ${parseFieldsByName(fields)}
    ORDER BY 1 desc, 2 desc
    limit 500
    `,
    queryParams
  )
}

async function clickhouseQuery(
  websiteId: string,
  parameters: BreakdownParameters,
  filters: QueryFilters
): Promise<BreakdownData[]> {
  const { parseFilters, rawQuery } = clickhouse
  const { startDate, endDate, fields } = parameters
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    eventType: EVENT_TYPE.pageView,
  })

  return rawQuery(
    `
    SELECT
      SUM(t.c) as "views",
      COUNT(DISTINCT t.session_id) as "visitors",
      COUNT(DISTINCT t.visit_id) as "visits",
      SUM(if(t.c = 1, 1, 0)) as "bounces",
      SUM(max_time-min_time) as "totaltime",
      ${parseFieldsByName(fields)}
    FROM (
      SELECT
        ${parseFields(fields)},
        session_id,
        visit_id,
        COUNT(*) c,
        MIN(created_at) min_time,
        MAX(created_at) max_time
      FROM website_event
      ${cohortQuery}
      WHERE website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
        ${filterQuery}
      GROUP BY ${parseFieldsByName(fields)}, 
        session_id, visit_id
    ) as t
    GROUP BY ${parseFieldsByName(fields)}
    ORDER BY 1 desc, 2 desc
    limit 500
    `,
    queryParams
  )
}

function parseFields(fields: string[]) {
  return fields.map((name) => `${FILTER_COLUMNS[name]} as "${name}"`).join(',')
}

function parseFieldsByName(fields: string[]) {
  return `${fields.map((name) => name).join(',')}`
}
