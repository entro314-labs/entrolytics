import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { getDateSQL, getTimestampDiffSQL, parseFilters, rawQuery } from '@/lib/analytics-utils';
import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, DRIZZLE, db, runQuery, websiteEvent } from '@/lib/db';

import type { QueryFilters } from '@/lib/types';

export async function getSessionActivity(
  ...args: [websiteId: string, sessionId: string, filters: QueryFilters]
) {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, sessionId: string, filters: QueryFilters) {
  const { startDate, endDate } = filters;

  return db
    .select()
    .from(websiteEvent)
    .where(
      and(
        eq(websiteEvent.sessionId, sessionId),
        eq(websiteEvent.websiteId, websiteId),
        gte(websiteEvent.createdAt, startDate),
        lte(websiteEvent.createdAt, endDate),
      ),
    )
    .limit(500)
    .orderBy(desc(websiteEvent.createdAt));
}

async function clickhouseQuery(websiteId: string, sessionId: string, filters: QueryFilters) {
  const { rawQuery } = clickhouse;
  const { startDate, endDate } = filters;

  return rawQuery(
    `
    SELECT
      created_at as createdAt,
      url_path as urlPath,
      url_query as urlQuery,
      referrer_domain as referrerDomain,
      event_id as eventId,
      event_type as eventType,
      event_name as eventName,
      visit_id as visitId,
      event_id IN (select event_id
                   from event_data
                   where website_id = {websiteId:UUID}
                    and session_id = {sessionId:UUID}
                    and created_at between {startDate:DateTime64} and {endDate:DateTime64}) AS hasData
    FROM website_event
    WHERE website_id = {websiteId:UUID}
      AND session_id = {sessionId:UUID}
      AND created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ORDER BY created_at desc
    limit 500
    `,
    { websiteId, sessionId, startDate, endDate },
  );
}
