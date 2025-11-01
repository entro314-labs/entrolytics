import clickhouse from "@/lib/clickhouse";
import { EVENT_COLUMNS } from "@/lib/constants";
import { CLICKHOUSE, DRIZZLE, runQuery } from "@/lib/db";
import {
	getTimestampDiffSQL,
	getDateSQL,
	parseFilters,
	rawQuery,
} from "@/lib/analytics-utils";

import { QueryFilters } from "@/lib/types";

export interface WebsiteSessionStatsData {
	pageviews: number;
	visitors: number;
	visits: number;
	countries: number;
	events: number;
}

export async function getWebsiteSessionStats(
	...args: [websiteId: string, filters: QueryFilters]
): Promise<WebsiteSessionStatsData[]> {
	return runQuery({
		[DRIZZLE]: () => relationalQuery(...args),
		[CLICKHOUSE]: () => clickhouseQuery(...args),
	});
}

async function relationalQuery(
	websiteId: string,
	filters: QueryFilters,
): Promise<WebsiteSessionStatsData[]> {
	// Using rawQuery FROM analytics-utils
	const { filterQuery, cohortQuery, queryParams } = parseFilters({
		...filters,
		websiteId,
	});

	return rawQuery(
		`
    SELECT
      COUNT(*) as "pageviews",
      COUNT(DISTINCT website_event.session_id) as "visitors",
      COUNT(DISTINCT website_event.visit_id) as "visits",
      COUNT(DISTINCT session.country) as "countries",
      SUM(CASE WHEN website_event.event_type = 2 THEN 1 ELSE 0 END) as "events"
    FROM website_event
    ${cohortQuery}
    JOIN session on website_event.session_id = session.session_id
    WHERE website_event.website_id = {{websiteId::uuid}}
      AND website_event.created_at between {{startDate}} AND {{endDate}}
      ${filterQuery}
    `,
		queryParams,
	);
}

async function clickhouseQuery(
	websiteId: string,
	filters: QueryFilters,
): Promise<WebsiteSessionStatsData[]> {
	const { rawQuery, parseFilters } = clickhouse;
	const { filterQuery, cohortQuery, queryParams } = parseFilters({
		...filters,
		websiteId,
	});

	let sql = "";

	if (
		filters &&
		typeof filters === "object" &&
		EVENT_COLUMNS.some((item) => Object.keys(filters).includes(item))
	) {
		sql = `
    SELECT
      sumIf(1, event_type = 1) as "pageviews",
      uniq(session_id) as "visitors",
      uniq(visit_id) as "visits",
      uniq(country) as "countries",
      SUM(length(event_name)) as "events"
    FROM website_event
    ${cohortQuery}
    WHERE website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
        ${filterQuery}
    `;
	} else {
		sql = `
    SELECT
      SUM(views) as "pageviews",
      uniq(session_id) as "visitors",
      uniq(visit_id) as "visits",
      uniq(country) as "countries",
      SUM(length(event_name)) as "events"
    FROM website_event_stats_hourly website_event
    ${cohortQuery}
    WHERE website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
        ${filterQuery}
    `;
	}

	return rawQuery(sql, queryParams);
}
