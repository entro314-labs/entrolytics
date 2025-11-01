import clickhouse from "@/lib/clickhouse";
import { EVENT_TYPE } from "@/lib/constants";
import { CLICKHOUSE, DRIZZLE, runQuery } from "@/lib/db";
import {
	getTimestampDiffSQL,
	getDateSQL,
	parseFilters,
	rawQuery,
} from "@/lib/analytics-utils";

import { QueryFilters } from "@/lib/types";

export interface UTMParameters {
	column: string;
	startDate: Date;
	endDate: Date;
}

export async function getUTM(
	...args: [websiteId: string, parameters: UTMParameters, filters: QueryFilters]
) {
	return runQuery({
		[DRIZZLE]: () => relationalQuery(...args),
		[CLICKHOUSE]: () => clickhouseQuery(...args),
	});
}

async function relationalQuery(
	websiteId: string,
	parameters: UTMParameters,
	filters: QueryFilters,
) {
	const { column, startDate, endDate } = parameters;
	// Using rawQuery FROM analytics-utils

	const { filterQuery, joinSessionQuery, cohortQuery, queryParams } =
		parseFilters({
			...filters,
			websiteId,
			startDate,
			endDate,
			eventType: EVENT_TYPE.pageView,
		});

	return rawQuery(
		`
    SELECT ${column} utm, COUNT(*) as views
    FROM website_event
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE website_id = {{websiteId::uuid}}
      AND created_at between {{startDate}} AND {{endDate}}
      AND coalesce(${column}, '') != ''
      ${filterQuery}
    GROUP BY 1
    ORDER BY 2 desc
    `,
		queryParams,
	);
}

async function clickhouseQuery(
	websiteId: string,
	parameters: UTMParameters,
	filters: QueryFilters,
) {
	const { column, startDate, endDate } = parameters;
	const { parseFilters, rawQuery } = clickhouse;
	const { filterQuery, cohortQuery, queryParams } = parseFilters({
		...filters,
		websiteId,
		startDate,
		endDate,
		eventType: EVENT_TYPE.pageView,
	});

	return rawQuery(
		`
    SELECT ${column} utm, COUNT(*) as views
    FROM website_event
    ${cohortQuery}
    WHERE website_id = {websiteId:UUID}
      AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
      AND ${column} != ''
      ${filterQuery}
    GROUP BY 1
    ORDER BY 2 desc
    `,
		queryParams,
	);
}
