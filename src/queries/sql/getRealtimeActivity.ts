import clickhouse from "@/lib/clickhouse";
import { runQuery, CLICKHOUSE, DRIZZLE } from "@/lib/db";
import {
	getTimestampDiffSQL,
	getDateSQL,
	parseFilters,
	rawQuery,
} from "@/lib/analytics-utils";
import { QueryFilters } from "@/lib/types";

export async function getRealtimeActivity(
	...args: [websiteId: string, filters: QueryFilters]
) {
	return runQuery({
		[DRIZZLE]: () => relationalQuery(...args),
		[CLICKHOUSE]: () => clickhouseQuery(...args),
	});
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
	// Using rawQuery FROM analytics-utils
	const { queryParams, filterQuery, cohortQuery, dateQuery } = parseFilters({
		...filters,
		websiteId,
	});

	return rawQuery(
		`
    SELECT
        website_event.session_id as "sessionId",
        website_event.event_name as "eventName",
        website_event.created_at as "createdAt",
        session.browser,
        session.os,
        session.device,
        session.country,
        website_event.url_path as "urlPath",
        website_event.referrer_domain as "referrerDomain"
    FROM website_event
    ${cohortQuery}
    INNER JOIN session
      on session.session_id = website_event.session_id
    WHERE website_event.website_id = {{websiteId::uuid}}
    ${filterQuery}
    ${dateQuery}
    ORDER BY website_event.created_at desc
    limit 100
    `,
		queryParams,
	);
}

async function clickhouseQuery(
	websiteId: string,
	filters: QueryFilters,
): Promise<{ x: number }> {
	const { rawQuery, parseFilters } = clickhouse;
	const { queryParams, filterQuery, cohortQuery, dateQuery } = parseFilters({
		...filters,
		websiteId,
	});

	return rawQuery(
		`
        SELECT
            session_id as sessionId,
            event_name as eventName,
            created_at as createdAt,
            browser,
            os,
            device,
            country,
            url_path as urlPath,
            referrer_domain as referrerDomain
        FROM website_event
        ${cohortQuery}
        WHERE website_id = {websiteId:UUID}
        ${filterQuery}
        ${dateQuery}
        ORDER BY createdAt desc
        limit 100
    `,
		queryParams,
	);
}
