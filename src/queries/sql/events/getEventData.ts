import { EventData } from '@/lib/db'

import clickhouse from '@/lib/clickhouse'
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db'
import { getTimestampDiffSQL, getDateSQL, parseFilters, rawQuery } from '@/lib/analytics-utils'

export async function getEventData(...args: [eventId: string]): Promise<EventData[]> {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  })
}

async function relationalQuery(eventId: string) {
  // Using rawQuery FROM analytics-utils

  return rawQuery(
    `
    SELECT website_id as websiteId,
       session_id as sessionId,
       event_id as eventId,
       url_path as urlPath,
       event_name as eventName,
       data_key as dataKey,
       string_value as stringValue,
       number_value as numberValue,
       date_value as dateValue,
       data_type as dataType,
       created_at as createdAt
    FROM event_data
    WHERE event_id = {{eventId::uuid}}
    `,
    { eventId }
  )
}

async function clickhouseQuery(eventId: string): Promise<EventData[]> {
  const { rawQuery } = clickhouse

  return rawQuery(
    `
      SELECT website_id as websiteId,
        session_id as sessionId,
        event_id as eventId,
        url_path as urlPath,
        event_name as eventName,
        data_key as dataKey,
        string_value as stringValue,
        number_value as numberValue,
        date_value as dateValue,
        data_type as dataType,
        created_at as createdAt
      FROM event_data
      WHERE event_id = {eventId:UUID}
    `,
    { eventId }
  )
}
