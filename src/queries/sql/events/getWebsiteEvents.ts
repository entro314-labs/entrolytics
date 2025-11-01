import clickhouse from "@/lib/clickhouse";
import { CLICKHOUSE, DRIZZLE, runQuery } from "@/lib/db";
import {
	getTimestampDiffSQL,
	getDateSQL,
	parseFilters,
	rawQuery,
	pagedRawQuery,
} from "@/lib/analytics-utils";

import { QueryFilters } from "@/lib/types";

export function getWebsiteEvents(
	...args: [websiteId: string, filters: QueryFilters]
) {
	return runQuery({
		[DRIZZLE]: () => relationalQuery(...args),
		[CLICKHOUSE]: () => clickhouseQuery(...args),
	});
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
	// Using pagedRawQuery and parseFilters from analytics-utils
	const { search } = filters;
	const { filterQuery, dateQuery, cohortQuery, queryParams } = parseFilters({
		...filters,
		websiteId,
		search: `%${search}%`,
	});

	const searchQuery = search
		? `AND ((event_name ilike {{search}} AND event_type = 2)
           OR (url_path ilike {{search}} AND event_type = 1))`
		: "";

	return pagedRawQuery(
		`
    SELECT
      event_id as "id",
      website_id as "websiteId", 
      session_id as "sessionId",
      created_at as "createdAt",
      hostname,
      url_path as "urlPath",
      url_query as "urlQuery",
      referrer_path as "referrerPath",
      referrer_query as "referrerQuery",
      referrer_domain as "referrerDomain",
      country as country,
      city as city,
      device as  device,
      os as os,
      browser as browser,
      page_title as "pageTitle",
      event_type as "eventType",
      event_name as "eventName"
    FROM website_event
    ${cohortQuery}
    JOIN session on website_event.session_id = session.session_id 
    WHERE website_id = {{websiteId::uuid}}
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
    ORDER BY created_at desc
    `,
		queryParams,
		filters,
	);
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters) {
	const { pagedRawQuery, parseFilters } = clickhouse;
	const { search } = filters;
	const { queryParams, dateQuery, cohortQuery, filterQuery } = parseFilters({
		...filters,
		websiteId,
	});

	const searchQuery = search
		? `AND ((positionCaseInsensitive(event_name, {search:String}) > 0 AND event_type = 2)
           OR (positionCaseInsensitive(url_path, {search:String}) > 0 AND event_type = 1))`
		: "";

	return pagedRawQuery(
		`
    SELECT
      event_id as id,
      website_id as websiteId, 
      session_id as sessionId,
      created_at as createdAt,
      hostname,
      url_path as urlPath,
      url_query as urlQuery,
      referrer_path as referrerPath,
      referrer_query as referrerQuery,
      referrer_domain as referrerDomain,
      country as country,
      city as city,
      device as device,
      os as os,
      browser as browser,
      page_title as pageTitle,
      event_type as eventType,
      event_name as eventName,
      event_id IN (SELECT event_id FROM event_data) as hasData
    FROM website_event
    ${cohortQuery}
    WHERE website_id = {websiteId:UUID}
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
    ORDER BY created_at desc
    `,
		queryParams,
		filters,
	);
}
