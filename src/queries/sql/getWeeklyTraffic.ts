import clickhouse from '@/lib/clickhouse'
import { runQuery, DRIZZLE, CLICKHOUSE } from '@/lib/db'
import { getTimestampDiffSQL, getDateSQL, getDateWeeklySQL, parseFilters, rawQuery } from '@/lib/analytics-utils'
import { QueryFilters } from '@/lib/types'
import { EVENT_COLUMNS } from '@/lib/constants'

export async function getWeeklyTraffic(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  })
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const timezone = 'utc'
  // Using rawQuery FROM analytics-utils
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  })

  return rawQuery(
    `
    SELECT
      ${getDateWeeklySQL('created_at', timezone)} as time,
      COUNT(DISTINCT session_id) as value
    FROM website_event
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE website_id = {{websiteId::uuid}}
      AND created_at between {{startDate}} AND {{endDate}}
      ${filterQuery}
    GROUP BY time
    ORDER BY 2
    `,
    queryParams
  ).then(formatResults)
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters) {
  const { timezone = 'utc' } = filters
  const { rawQuery, parseFilters } = clickhouse
  const { filterQuery, cohortQuery, queryParams } = await parseFilters({ ...filters, websiteId })

  let sql = ''

  if (filters && typeof filters === 'object' && EVENT_COLUMNS.some((item) => Object.keys(filters).includes(item))) {
    sql = `
    SELECT
      formatDateTime(toDateTime(created_at, '${timezone}'), '%w:%H') as time,
      COUNT(DISTINCT session_id) as value
    FROM website_event
    ${cohortQuery}
    WHERE website_id = {websiteId:UUID}
      AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
      ${filterQuery}
    GROUP BY time
    ORDER BY time
    `
  } else {
    sql = `
    SELECT
      formatDateTime(toDateTime(created_at, '${timezone}'), '%w:%H') as time,
      COUNT(DISTINCT session_id) as value
    FROM website_event_stats_hourly website_event
    ${cohortQuery}
    WHERE website_id = {websiteId:UUID}
      AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
      ${filterQuery}
    GROUP BY time
    ORDER BY time
    `
  }

  return rawQuery(sql, queryParams).then(formatResults)
}

function formatResults(data: any) {
  const days = []

  // Add array check to prevent .find() error
  if (!Array.isArray(data)) {
    data = []
  }

  for (let i = 0; i < 7; i++) {
    days.push([])

    for (let j = 0; j < 24; j++) {
      days[i].push(
        Number(
          data.find(({ time }) => time === `${i}:${j.toString().padStart(2, '0')}`)?.value || 0
        )
      )
    }
  }

  return days
}
