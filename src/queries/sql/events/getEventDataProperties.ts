import clickhouse from '@/lib/clickhouse'
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db'
import { getTimestampDiffSQL, getDateSQL, parseFilters, rawQuery } from '@/lib/analytics-utils'
import { QueryFilters } from '@/lib/types'

export async function getEventDataProperties(
  ...args: [websiteId: string, filters: QueryFilters & { propertyName?: string }]
) {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  })
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters & { propertyName?: string }
) {
  // Using rawQuery FROM analytics-utils
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters(
    { ...filters, websiteId },
    {
      columns: { propertyName: 'data_key' },
    }
  )

  return rawQuery(
    `
    SELECT
      website_event.event_name as "eventName",
      event_data.data_key as "propertyName",
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
    GROUP BY website_event.event_name, event_data.data_key
    ORDER BY 3 desc
    limit 500
    `,
    queryParams
  )
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters & { propertyName?: string }
): Promise<{ eventName: string; propertyName: string; total: number }[]> {
  const { rawQuery, parseFilters } = clickhouse
  const { filterQuery, cohortQuery, queryParams } = parseFilters(
    { ...filters, websiteId },
    {
      columns: { propertyName: 'data_key' },
    }
  )

  return rawQuery(
    `
    SELECT
      event_name as eventName,
      data_key as propertyName,
      COUNT(*) as total
    FROM event_data
    JOIN website_event
    ON website_event.event_id = event_data.event_id
      AND website_event.website_id = event_data.website_id
      AND website_event.website_id = {websiteId:UUID}
      AND website_event.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
    ${cohortQuery}
    WHERE event_data.website_id = {websiteId:UUID}
      AND event_data.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
    ${filterQuery}
    GROUP BY event_name, data_key
    ORDER BY 1, 3 desc
    limit 500
    `,
    queryParams
  )
}
