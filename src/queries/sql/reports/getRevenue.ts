import clickhouse from "@/lib/clickhouse";
import { CLICKHOUSE, DRIZZLE, runQuery } from "@/lib/db";
import {
	getTimestampDiffSQL,
	getDateSQL,
	parseFilters,
	rawQuery,
} from "@/lib/analytics-utils";

import { QueryFilters } from "@/lib/types";

export interface RevenuParameters {
	startDate: Date;
	endDate: Date;
	unit: string;
	currency: string;
}

export interface RevenueResult {
	chart: { x: string; t: string; y: number }[];
	country: { name: string; value: number }[];
	total: { SUM: number; COUNT: number; average: number; unique_count: number };
	table: {
		currency: string;
		SUM: number;
		COUNT: number;
		unique_count: number;
	}[];
}

export async function getRevenue(
	...args: [
		websiteId: string,
		parameters: RevenuParameters,
		filters: QueryFilters,
	]
) {
	return runQuery({
		[DRIZZLE]: () => relationalQuery(...args),
		[CLICKHOUSE]: () => clickhouseQuery(...args),
	});
}

async function relationalQuery(
	websiteId: string,
	parameters: RevenuParameters,
	filters: QueryFilters,
): Promise<RevenueResult> {
	const { startDate, endDate, currency, unit = "day" } = parameters;
	const { timezone = "UTC" } = filters;
	// Using rawQuery FROM analytics-utils
	const { queryParams, filterQuery, cohortQuery, joinSessionQuery } =
		parseFilters({
			...filters,
			websiteId,
			startDate,
			endDate,
			currency,
		});

	const chart = await rawQuery(
		`
    SELECT
      revenue.event_name x,
      ${getDateSQL("revenue.created_at", unit, timezone)} t,
      SUM(revenue.revenue) y
    FROM revenue
    JOIN website_event
      on website_event.website_id = revenue.website_id
        AND website_event.session_id = revenue.session_id
        AND website_event.event_id = revenue.event_id
        AND website_event.website_id = {{websiteId::uuid}}
        AND website_event.created_at between {{startDate}} AND {{endDate}}
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE revenue.website_id = {{websiteId::uuid}}
      AND revenue.created_at between {{startDate}} AND {{endDate}}
      AND revenue.currency like {{currency}}
      ${filterQuery}
    GROUP BY  x, t
    ORDER BY t
    `,
		queryParams,
	);

	const country = await rawQuery(
		`
    SELECT
      session.country as name,
      SUM(r.revenue) value
    FROM revenue 
    JOIN website_event
      on website_event.website_id = revenue.website_id
        AND website_event.session_id = revenue.session_id
        AND website_event.event_id = revenue.event_id
        AND website_event.website_id = {{websiteId::uuid}}
        AND website_event.created_at between {{startDate}} AND {{endDate}}
    JOIN session 
      on session.website_id = revenue.website_id
        AND session.session_id = revenue.session_id
    ${cohortQuery}
    WHERE revenue.website_id = {{websiteId::uuid}}
      AND revenue.created_at between {{startDate}} AND {{endDate}}
      AND revenue.currency = {{currency}}
      ${filterQuery}
    GROUP BY session.country
    `,
		queryParams,
	);

	const total = await rawQuery(
		`
    SELECT
      SUM(revenue.revenue) as SUM,
      COUNT(DISTINCT revenue.event_id) as COUNT,
      COUNT(DISTINCT revenue.session_id) as unique_count
    FROM revenue
    JOIN website_event
      on website_event.website_id = revenue.website_id
        AND website_event.session_id = revenue.session_id
        AND website_event.event_id = revenue.event_id
        AND website_event.website_id = {{websiteId::uuid}}
        AND website_event.created_at between {{startDate}} AND {{endDate}}
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE revenue.website_id = {{websiteId::uuid}}
      AND revenue.created_at between {{startDate}} AND {{endDate}}
      AND revenue.currency = {{currency}}
      ${filterQuery}
  `,
		queryParams,
	).then((result) => result?.[0]);

	total.average = total.COUNT > 0 ? total.SUM / total.COUNT : 0;

	const table = await rawQuery(
		`
    SELECT
      revenue.currency,
      SUM(revenue.revenue) as SUM,
      COUNT(DISTINCT revenue.event_id) as COUNT,
      COUNT(DISTINCT revenue.session_id) as unique_count
    FROM revenue
    JOIN website_event
      on website_event.website_id = revenue.website_id
        AND website_event.session_id = revenue.session_id
        AND website_event.event_id = revenue.event_id
        AND website_event.website_id = {{websiteId::uuid}}
        AND website_event.created_at between {{startDate}} AND {{endDate}}
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE revenue.website_id = {{websiteId::uuid}}
      AND revenue.created_at between {{startDate}} AND {{endDate}}
      ${filterQuery}
    GROUP BY revenue.currency
    ORDER BY SUM desc
    `,
		queryParams,
	);

	return { chart, country, table, total };
}

async function clickhouseQuery(
	websiteId: string,
	parameters: RevenuParameters,
	filters: QueryFilters,
): Promise<RevenueResult> {
	const { startDate, endDate, unit = "day", currency } = parameters;
	const { timezone = "UTC" } = filters;
	const { getDateSQL, rawQuery, parseFilters } = clickhouse;
	const { filterQuery, cohortQuery, queryParams } = parseFilters({
		...filters,
		websiteId,
		startDate,
		endDate,
		currency,
	});

	const chart = await rawQuery<
		{
			x: string;
			t: string;
			y: number;
		}[]
	>(
		`
    SELECT
      website_revenue.event_name x,
      ${getDateSQL("website_revenue.created_at", unit, timezone)} t,
      SUM(website_revenue.revenue) y
    FROM website_revenue
    JOIN website_event
          on website_event.website_id = website_revenue.website_id
            AND website_event.session_id = website_revenue.session_id
            AND website_event.event_id = website_revenue.event_id
            AND website_event.website_id = {websiteId:UUID}
            AND website_event.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
    ${cohortQuery}
    WHERE website_revenue.website_id = {websiteId:UUID}
      AND website_revenue.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
      AND website_revenue.currency = {currency:String}
      ${filterQuery}
    GROUP BY  x, t
    ORDER BY t
    `,
		queryParams,
	);

	const country = await rawQuery<
		{
			name: string;
			value: number;
		}[]
	>(
		`
    SELECT
      website_event.country as name,
      SUM(website_revenue.revenue) as value
    FROM website_revenue
    JOIN website_event
          on website_event.website_id = website_revenue.website_id
            AND website_event.session_id = website_revenue.session_id
            AND website_event.event_id = website_revenue.event_id
            AND website_event.website_id = {websiteId:UUID}
            AND website_event.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
    ${cohortQuery}
    WHERE website_revenue.website_id = {websiteId:UUID}
      AND website_revenue.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
      AND website_revenue.currency = {currency:String}
      ${filterQuery}
    GROUP BY website_event.country
    `,
		queryParams,
	);

	const total = await rawQuery<{
		SUM: number;
		COUNT: number;
		unique_count: number;
	}>(
		`
    SELECT
      SUM(website_revenue.revenue) as SUM,
      uniqExact(website_revenue.event_id) as COUNT,
      uniqExact(website_revenue.session_id) as unique_count
    FROM website_revenue
    JOIN website_event
          on website_event.website_id = website_revenue.website_id
            AND website_event.session_id = website_revenue.session_id
            AND website_event.event_id = website_revenue.event_id
            AND website_event.website_id = {websiteId:UUID}
            AND website_event.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
    ${cohortQuery}
    WHERE website_revenue.website_id = {websiteId:UUID}
      AND website_revenue.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
      AND website_revenue.currency = {currency:String}
      ${filterQuery}
    `,
		queryParams,
	).then((result) => result?.[0]);

	total.average = total.COUNT > 0 ? total.SUM / total.COUNT : 0;

	const table = await rawQuery<
		{
			currency: string;
			SUM: number;
			COUNT: number;
			unique_count: number;
		}[]
	>(
		`
    SELECT
      website_revenue.currency,
      SUM(website_revenue.revenue) as SUM,
      uniqExact(website_revenue.event_id) as COUNT,
      uniqExact(website_revenue.session_id) as unique_count
    FROM website_revenue
    JOIN website_event
          on website_event.website_id = website_revenue.website_id
            AND website_event.session_id = website_revenue.session_id
            AND website_event.event_id = website_revenue.event_id
            AND website_event.website_id = {websiteId:UUID}
            AND website_event.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
    ${cohortQuery}
    WHERE website_revenue.website_id = {websiteId:UUID}
      AND website_revenue.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
      ${filterQuery}
    GROUP BY website_revenue.currency
    ORDER BY SUM desc
    `,
		queryParams,
	);

	return { chart, country, table, total };
}
