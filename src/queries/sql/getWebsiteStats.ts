import clickhouse from "@/lib/clickhouse";
import { EVENT_TYPE } from "@/lib/constants";
import { CLICKHOUSE, DRIZZLE, runQuery } from "@/lib/db";
import {
	getTimestampDiffSQL,
	parseFilters,
	rawQuery,
} from "@/lib/analytics-utils";
import { QueryFilters } from "@/lib/types";
import { EVENT_COLUMNS } from "@/lib/constants";

export interface WebsiteStatsData {
	pageviews: number;
	visitors: number;
	visits: number;
	bounces: number;
	totaltime: number;
}

export async function getWebsiteStats(
	...args: [websiteId: string, filters: QueryFilters]
): Promise<WebsiteStatsData[]> {
	return runQuery({
		[DRIZZLE]: () => relationalQuery(...args),
		[CLICKHOUSE]: () => clickhouseQuery(...args),
	});
}

async function relationalQuery(
	websiteId: string,
	filters: QueryFilters,
): Promise<WebsiteStatsData[]> {
	const { filterQuery, joinSessionQuery, cohortQuery, queryParams } =
		parseFilters({
			...filters,
			websiteId,
			eventType: EVENT_TYPE.pageView,
		});

	return rawQuery(
		`
    SELECT
      SUM(t.c) as "pageviews",
      COUNT(DISTINCT t.session_id) as "visitors",
      COUNT(DISTINCT t.visit_id) as "visits",
      SUM(CASE WHEN t.c = 1 THEN 1 ELSE 0 END) as "bounces",
      SUM(${getTimestampDiffSQL("t.min_time", "t.max_time")}) as "totaltime"
    FROM (
      SELECT
        website_event.session_id,
        website_event.visit_id,
        COUNT(*) as "c",
        MIN(website_event.created_at) as "min_time",
        MAX(website_event.created_at) as "max_time"
      FROM website_event
      ${cohortQuery}
      ${joinSessionQuery}
      WHERE website_event.website_id = {{websiteId::uuid}}
        AND website_event.created_at BETWEEN {{startDate}} AND {{endDate}}
        ${filterQuery}
      GROUP BY 1, 2
    ) as t
    `,
		queryParams,
	);
}

async function clickhouseQuery(
	websiteId: string,
	filters: QueryFilters,
): Promise<WebsiteStatsData[]> {
	const { rawQuery, parseFilters } = clickhouse;
	const { filterQuery, cohortQuery, queryParams } = parseFilters({
		...filters,
		websiteId,
		eventType: EVENT_TYPE.pageView,
	});

	let sql = "";

	if (
		filters &&
		typeof filters === "object" &&
		EVENT_COLUMNS.some((item) => Object.keys(filters).includes(item))
	) {
		sql = `
    select
      sum(t.c) as "pageviews",
      uniq(t.session_id) as "visitors",
      uniq(t.visit_id) as "visits",
      sum(if(t.c = 1, 1, 0)) as "bounces",
      sum(max_time-min_time) as "totaltime"
    from (
      select
        session_id,
        visit_id,
        count(*) c,
        min(created_at) min_time,
        max(created_at) max_time
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        ${filterQuery}
      group by session_id, visit_id
    ) as t;
    `;
	} else {
		sql = `
    select
      sum(t.c) as "pageviews",
      uniq(session_id) as "visitors",
      uniq(visit_id) as "visits",
      sumIf(1, t.c = 1) as "bounces",
      sum(max_time-min_time) as "totaltime"
    from (select
            session_id,
            visit_id,
            sum(views) c,
            min(min_time) min_time,
            max(max_time) max_time
        from website_event_stats_hourly "website_event"
        ${cohortQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${filterQuery}
      group by session_id, visit_id
    ) as t;
    `;
	}

	return rawQuery(sql, queryParams).then((result) => result?.[0]);
}
