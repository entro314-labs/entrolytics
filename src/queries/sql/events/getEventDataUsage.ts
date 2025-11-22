import clickhouse from '@/lib/clickhouse'
import { CLICKHOUSE, DRIZZLE, runQuery, notImplemented } from '@/lib/db'
import { getTimestampDiffSQL, getDateSQL, parseFilters, rawQuery } from '@/lib/analytics-utils'
import { QueryFilters } from '@/lib/types'

export function getEventDataUsage(...args: [websiteIds: string[], filters: QueryFilters]) {
  return runQuery({
    [DRIZZLE]: notImplemented,
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  })
}

function clickhouseQuery(
  websiteIds: string[],
  filters: QueryFilters
): Promise<{ websiteId: string; COUNT: number }[]> {
  const { rawQuery } = clickhouse
  const { startDate, endDate } = filters

  return rawQuery(
    `
    SELECT 
      website_id as websiteId,
      COUNT(*) as COUNT
    FROM event_data 
    WHERE created_at between {startDate:DateTime64} AND {endDate:DateTime64}
      AND website_id in {websiteIds:Array(UUID)}
    GROUP BY website_id
    `,
    {
      websiteIds,
      startDate,
      endDate,
    }
  )
}
