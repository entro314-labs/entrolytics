import clickhouse from "@/lib/clickhouse";
import {
	EMAIL_DOMAINS,
	EVENT_TYPE,
	PAID_AD_PARAMS,
	SEARCH_DOMAINS,
	SHOPPING_DOMAINS,
	SOCIAL_DOMAINS,
	VIDEO_DOMAINS,
} from "@/lib/constants";
import { CLICKHOUSE, DRIZZLE, runQuery } from "@/lib/db";
import {
	getTimestampDiffSQL,
	getDateSQL,
	parseFilters,
	rawQuery,
} from "@/lib/analytics-utils";

import { QueryFilters } from "@/lib/types";

export async function getChannelMetrics(
	...args: [websiteId: string, filters?: QueryFilters]
) {
	return runQuery({
		[DRIZZLE]: () => relationalQuery(...args),
		[CLICKHOUSE]: () => clickhouseQuery(...args),
	});
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
	// Using rawQuery FROM analytics-utils
	const { queryParams, filterQuery, joinSessionQuery, cohortQuery, dateQuery } =
		parseFilters({
			...filters,
			websiteId,
			eventType: EVENT_TYPE.pageView,
		});

	return rawQuery(
		`
    WITH base_data AS (
      SELECT
        session_id,
        referrer_domain,
        url_query,
        utm_medium,
        utm_source,
        CASE WHEN ${toPostgresPositionClause("utm_medium", ["cp", "ppc", "retargeting", "paid"])} THEN 'paid' ELSE 'organic' END as prefix
      FROM website_event
      ${cohortQuery}
      ${joinSessionQuery}
      WHERE website_id = {{websiteId::uuid}}
        ${dateQuery}
        ${filterQuery}
    ),
    channels as (
      SELECT
          CASE
          WHEN referrer_domain = '' AND url_query = '' THEN 'direct'
          WHEN ${toPostgresPositionClause("url_query", PAID_AD_PARAMS)} THEN 'paidAds'
          WHEN ${toPostgresPositionClause("utm_medium", ["referral", "app", "link"])} THEN 'referral'
          WHEN position(utm_medium, 'affiliate') > 0 THEN 'affiliate'
          WHEN position(utm_medium, 'sms') > 0 OR position(utm_source, 'sms') > 0 THEN 'sms'
          WHEN ${toPostgresPositionClause("referrer_domain", SEARCH_DOMAINS)} OR position(utm_medium, 'organic') > 0 THEN concat(prefix, 'Search')
          WHEN ${toPostgresPositionClause("referrer_domain", SOCIAL_DOMAINS)} THEN concat(prefix, 'Social')
          WHEN ${toPostgresPositionClause("referrer_domain", EMAIL_DOMAINS)} OR position(utm_medium, 'mail') > 0 THEN 'email'
          WHEN ${toPostgresPositionClause("referrer_domain", SHOPPING_DOMAINS)} OR position(utm_medium, 'shop') > 0 THEN concat(prefix, 'Shopping')
          WHEN ${toPostgresPositionClause("referrer_domain", VIDEO_DOMAINS)} OR position(utm_medium, 'video') > 0 THEN concat(prefix, 'Video')
          ELSE '' END AS x,
        COUNT(DISTINCT session_id) y
      FROM base_data
      GROUP BY prefix, referrer_domain, url_query, utm_medium, utm_source
      ORDER BY y desc)

    SELECT x, SUM(y) y
    FROM channels
    WHERE x != ''
    GROUP BY x
    ORDER BY y desc;
    `,
		queryParams,
	);
}

async function clickhouseQuery(
	websiteId: string,
	filters: QueryFilters,
): Promise<{ x: string; y: number }[]> {
	const { rawQuery, parseFilters } = clickhouse;
	const { queryParams, filterQuery, cohortQuery, dateQuery } = parseFilters({
		...filters,
		websiteId,
		eventType: EVENT_TYPE.pageView,
	});

	const sql = `
    WITH channels as (
      SELECT CASE WHEN multiSearchAny(utm_medium, ['cp', 'ppc', 'retargeting', 'paid']) != 0 THEN 'paid' ELSE 'organic' END prefix,
          CASE
          WHEN referrer_domain = '' AND url_query = '' THEN 'direct'
          WHEN multiSearchAny(url_query, [${toClickHouseStringArray(
						PAID_AD_PARAMS,
					)}]) != 0 THEN 'paidAds'
          WHEN multiSearchAny(utm_medium, ['referral', 'app','link']) != 0 THEN 'referral'
          WHEN position(utm_medium, 'affiliate') > 0 THEN 'affiliate'
          WHEN position(utm_medium, 'sms') > 0 OR position(utm_source, 'sms') > 0 THEN 'sms'
          WHEN multiSearchAny(referrer_domain, [${toClickHouseStringArray(
						SEARCH_DOMAINS,
					)}]) != 0 OR position(utm_medium, 'organic') > 0 THEN concat(prefix, 'Search')
          WHEN multiSearchAny(referrer_domain, [${toClickHouseStringArray(
						SOCIAL_DOMAINS,
					)}]) != 0 THEN concat(prefix, 'Social')
          WHEN multiSearchAny(referrer_domain, [${toClickHouseStringArray(
						EMAIL_DOMAINS,
					)}]) != 0 OR position(utm_medium, 'mail') > 0 THEN 'email'
          WHEN multiSearchAny(referrer_domain, [${toClickHouseStringArray(
						SHOPPING_DOMAINS,
					)}]) != 0 OR position(utm_medium, 'shop') > 0 THEN concat(prefix, 'Shopping')
          WHEN multiSearchAny(referrer_domain, [${toClickHouseStringArray(
						VIDEO_DOMAINS,
					)}]) != 0 OR position(utm_medium, 'video') > 0 THEN concat(prefix, 'Video')
          ELSE '' END AS x,
        COUNT(DISTINCT session_id) y
      FROM website_event
      ${cohortQuery}
      WHERE website_id = {websiteId:UUID}
        ${dateQuery}
        ${filterQuery}
      GROUP BY 1, 2
      ORDER BY y desc)

    SELECT x, SUM(y) y
    FROM channels
    WHERE x != ''
    GROUP BY x
    ORDER BY y desc;
  `;

	return rawQuery(sql, queryParams);
}

function toClickHouseStringArray(arr: string[]): string {
	return arr.map((p) => `'${p.replace(/'/g, "\\'")}'`).join(", ");
}

function toPostgresPositionClause(column: string, arr: string[]) {
	return arr
		.map((val) => `position(${column}, '${val.replace(/'/g, "''")}') > 0`)
		.join(" OR\n  ");
}
