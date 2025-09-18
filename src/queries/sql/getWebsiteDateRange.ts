import clickhouse from '@/lib/clickhouse'
import { runQuery, CLICKHOUSE, DRIZZLE } from '@/lib/db'
import { getTimestampDiffSQL, getDateSQL, parseFilters, rawQuery } from '@/lib/analytics-utils'
import { DEFAULT_RESET_DATE } from '@/lib/constants'

export async function getWebsiteDateRange(...args: [websiteId: string]) {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  })
}

async function relationalQuery(websiteId: string) {
  // Using rawQuery FROM analytics-utils
  const { queryParams } = parseFilters({
    startDate: new Date(DEFAULT_RESET_DATE),
    websiteId,
  })

  const result = await rawQuery(
    `
    SELECT
      MIN(created_at) as mindate,
      MAX(created_at) as maxdate
    FROM website_event
    WHERE website_id = {{websiteId::uuid}}
      AND created_at >= {{startDate}}
    `,
    queryParams
  )

  return result[0] ?? null
}

async function clickhouseQuery(websiteId: string) {
  const { rawQuery, parseFilters } = clickhouse
  const { queryParams } = parseFilters({
    startDate: new Date(DEFAULT_RESET_DATE),
    websiteId,
  })

  const result = await rawQuery(
    `
    SELECT
      MIN(created_at) as mindate,
      MAX(created_at) as maxdate
    FROM website_event_stats_hourly
    WHERE website_id = {websiteId:UUID}
      AND created_at >= {startDate:DateTime64}
    `,
    queryParams
  )

  return result[0] ?? null
}
