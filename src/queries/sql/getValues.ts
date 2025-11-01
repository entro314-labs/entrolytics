import clickhouse from "@/lib/clickhouse";
import { runQuery, CLICKHOUSE, DRIZZLE } from "@/lib/db";
import {
	getTimestampDiffSQL,
	getDateSQL,
	parseFilters,
	rawQuery,
	getSearchSQL,
} from "@/lib/analytics-utils";
import { QueryFilters } from "@/lib/types";

export async function getValues(
	...args: [websiteId: string, column: string, filters: QueryFilters]
) {
	return runQuery({
		[DRIZZLE]: () => relationalQuery(...args),
		[CLICKHOUSE]: () => clickhouseQuery(...args),
	});
}

async function relationalQuery(
	websiteId: string,
	column: string,
	filters: QueryFilters,
) {
	// Using rawQuery FROM analytics-utils
	const params = {};
	const { startDate, endDate, search } = filters;

	let searchQuery = "";
	let excludeDomain = "";

	if (column === "referrer_domain") {
		excludeDomain = `AND website_event.referrer_domain != website_event.hostname
      AND website_event.referrer_domain != ''`;
	}

	if (search) {
		if (decodeURIComponent(search).includes(",")) {
			searchQuery = `AND (${decodeURIComponent(search)
				.split(",")
				.slice(0, 5)
				.map((value: string, index: number) => {
					const key = `search${index}`;

					params[key] = value;

					return getSearchSQL(column, key).replace("AND ", "");
				})
				.join(" OR ")})`;
		} else {
			searchQuery = getSearchSQL(column);
		}
	}

	return rawQuery(
		`
    SELECT ${column} as "value", COUNT(*) as "COUNT"
    FROM website_event
    INNER JOIN session
      on session.session_id = website_event.session_id
    WHERE website_event.website_id = {{websiteId::uuid}}
      AND website_event.created_at between {{startDate}} AND {{endDate}}
      ${searchQuery}
      ${excludeDomain}
    GROUP BY 1
    ORDER BY 2 desc
    limit 10
    `,
		{
			websiteId,
			startDate,
			endDate,
			search: `%${search}%`,
			...params,
		},
	);
}

async function clickhouseQuery(
	websiteId: string,
	column: string,
	filters: QueryFilters,
) {
	const { rawQuery, getSearchSQL } = clickhouse;
	const params = {};
	const { startDate, endDate, search } = filters;

	let searchQuery = "";
	let excludeDomain = "";

	if (column === "referrer_domain") {
		excludeDomain = `AND referrer_domain != hostname AND referrer_domain != ''`;
	}

	if (search) {
		searchQuery = `AND positionCaseInsensitive(${column}, {search:String}) > 0`;
	}

	if (search) {
		if (decodeURIComponent(search).includes(",")) {
			searchQuery = `AND (${decodeURIComponent(search)
				.split(",")
				.slice(0, 5)
				.map((value: string, index: number) => {
					const key = `search${index}`;

					params[key] = value;

					return getSearchSQL(column, key).replace("AND ", "");
				})
				.join(" OR ")})`;
		} else {
			searchQuery = getSearchSQL(column);
		}
	}

	return rawQuery(
		`
    SELECT ${column} as "value", COUNT(*) as "COUNT"
    FROM website_event
    WHERE website_id = {websiteId:UUID}
      AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
      ${searchQuery}
      ${excludeDomain}
    GROUP BY 1
    ORDER BY 2 desc
    limit 10
    `,
		{
			websiteId,
			startDate,
			endDate,
			search,
			...params,
		},
	);
}
