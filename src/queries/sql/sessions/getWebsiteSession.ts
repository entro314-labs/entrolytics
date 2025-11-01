import clickhouse from "@/lib/clickhouse";
import { runQuery, DRIZZLE, CLICKHOUSE } from "@/lib/db";
import {
	getTimestampDiffSQL,
	getDateSQL,
	parseFilters,
	rawQuery,
} from "@/lib/analytics-utils";

export async function getWebsiteSession(
	...args: [websiteId: string, sessionId: string]
) {
	return runQuery({
		[DRIZZLE]: () => relationalQuery(...args),
		[CLICKHOUSE]: () => clickhouseQuery(...args),
	});
}

async function relationalQuery(websiteId: string, sessionId: string) {
	// Using rawQuery FROM analytics-utils

	return rawQuery(
		`
    SELECT id,
      distinct_id as "distinctId",
      website_id as "websiteId",
      browser,
      os,
      device,
      screen,
      language,
      country,
      region,
      city,
      MIN(min_time) as "firstAt",
      MAX(max_time) as "lastAt",
      COUNT(DISTINCT visit_id) as visits,
      SUM(views) as views,
      SUM(events) as events,
      SUM(${getTimestampDiffSQL("min_time", "max_time")}) as "totaltime" 
    FROM (SELECT
          session.session_id as id,
          session.distinct_id,
          website_event.visit_id,
          session.website_id,
          session.browser,
          session.os,
          session.device,
          session.screen,
          session.language,
          session.country,
          session.region,
          session.city,
          MIN(website_event.created_at) as min_time,
          MAX(website_event.created_at) as max_time,
          SUM(CASE WHEN website_event.event_type = 1 THEN 1 ELSE 0 END) as views,
          SUM(CASE WHEN website_event.event_type = 2 THEN 1 ELSE 0 END) as events
    FROM session
    JOIN website_event on website_event.session_id = session.session_id
    WHERE session.website_id = {{websiteId::uuid}}
      AND session.session_id = {{sessionId::uuid}}
    GROUP BY session.session_id, session.distinct_id, visit_id, session.website_id, session.browser, session.os, session.device, session.screen, session.language, session.country, session.region, session.city) t
    GROUP BY id, distinct_id, website_id, browser, os, device, screen, language, country, region, city;
    `,
		{ websiteId, sessionId },
	).then((result) => result?.[0]);
}

async function clickhouseQuery(websiteId: string, sessionId: string) {
	const { rawQuery, getDateStringSQL } = clickhouse;

	return rawQuery(
		`
    SELECT id,
      websiteId,
      distinctId,
      browser,
      os,
      device,
      screen,
      language,
      country,
      region,
      city,
      ${getDateStringSQL("MIN(min_time)")} as firstAt,
      ${getDateStringSQL("MAX(max_time)")} as lastAt,
      uniq(visit_id) visits,
      SUM(views) as views,
      SUM(events) as events,
      SUM(max_time-min_time) as totaltime
    FROM (SELECT
              session_id as id,
              distinct_id as distinctId,
              visit_id,
              website_id as websiteId,
              browser,
              os,
              device,
              screen,
              language,
              country,
              region,
              city,
              MIN(min_time) as min_time,
              MAX(max_time) as max_time,
              SUM(views) as views,
              length(groupArrayArray(event_name)) as events
        FROM website_event_stats_hourly
        WHERE website_id = {websiteId:UUID}
          AND session_id = {sessionId:UUID}
        GROUP BY session_id, distinct_id, visit_id, website_id, browser, os, device, screen, language, country, region, city) t
    GROUP BY id, websiteId, distinctId, browser, os, device, screen, language, country, region, city;
    `,
		{ websiteId, sessionId },
	).then((result) => result?.[0]);
}
