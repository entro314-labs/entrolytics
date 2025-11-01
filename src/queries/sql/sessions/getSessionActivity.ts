import clickhouse from "@/lib/clickhouse";
import { CLICKHOUSE, DRIZZLE, runQuery, db, websiteEvent } from "@/lib/db";
import {
	getTimestampDiffSQL,
	getDateSQL,
	parseFilters,
	rawQuery,
} from "@/lib/analytics-utils";
import { eq, and, gte, lte, desc } from "drizzle-orm";

import { QueryFilters } from "@/lib/types";

export async function getSessionActivity(
	...args: [websiteId: string, sessionId: string, filters: QueryFilters]
) {
	return runQuery({
		[DRIZZLE]: () => relationalQuery(...args),
		[CLICKHOUSE]: () => clickhouseQuery(...args),
	});
}

async function relationalQuery(
	websiteId: string,
	sessionId: string,
	filters: QueryFilters,
) {
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

async function clickhouseQuery(
	websiteId: string,
	sessionId: string,
	filters: QueryFilters,
) {
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
      event_id IN (SELECT event_id FROM event_data) AS hasData
    FROM website_event e 
    WHERE e.website_id = {websiteId:UUID}
      AND e.session_id = {sessionId:UUID} 
      AND e.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
    ORDER BY e.created_at desc
    limit 500
    `,
		{ websiteId, sessionId, startDate, endDate },
	);
}
