import clickhouse from "@/lib/clickhouse";
import { CLICKHOUSE, DRIZZLE, runQuery } from "@/lib/db";
import {
	getTimestampDiffSQL,
	getDateSQL,
	parseFilters,
	rawQuery,
	getAddIntervalQuery,
} from "@/lib/analytics-utils";

import { QueryFilters } from "@/lib/types";

export interface FunnelParameters {
	startDate: Date;
	endDate: Date;
	window: number;
	steps: { type: string; value: string }[];
}

export interface FunnelResult {
	value: string;
	visitors: number;
	dropoff: number;
}

export async function getFunnel(
	...args: [
		websiteId: string,
		parameters: FunnelParameters,
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
	parameters: FunnelParameters,
	filters: QueryFilters,
): Promise<FunnelResult[]> {
	const { startDate, endDate, window, steps } = parameters;
	// Using rawQuery FROM analytics-utils
	const { levelOneQuery, levelQuery, sumQuery, params } = getFunnelQuery(
		steps,
		window,
	);

	const { filterQuery, joinSessionQuery, cohortQuery, queryParams } =
		parseFilters({
			...filters,
			websiteId,
			startDate,
			endDate,
		});

	function getFunnelQuery(
		steps: { type: string; value: string }[],
		window: number,
	): {
		levelOneQuery: string;
		levelQuery: string;
		sumQuery: string;
		params: string[];
	} {
		return steps.reduce(
			(pv, cv, i) => {
				const levelNumber = i + 1;
				const startSum = i > 0 ? "union " : "";
				const isURL = cv.type === "path";
				const column = isURL ? "url_path" : "event_name";

				let operator = "=";
				let paramValue = cv.value;

				if (cv.value.startsWith("*") || cv.value.endsWith("*")) {
					operator = "like";
					paramValue = cv.value.replace(/^\*|\*$/g, "%");
				}

				if (levelNumber === 1) {
					pv.levelOneQuery = `
          WITH level1 AS (
            SELECT DISTINCT session_id, created_at
            FROM website_event
            ${cohortQuery}
            ${joinSessionQuery}
            WHERE website_id = {{websiteId::uuid}}
              AND created_at between {{startDate}} AND {{endDate}}
              AND ${column} ${operator} {{${i}}}
              ${filterQuery}
          )`;
				} else {
					pv.levelQuery += `
          , level${levelNumber} AS (
            SELECT DISTINCT we.session_id, we.created_at
            FROM level${i} l
            JOIN website_event we
                on l.session_id = we.session_id
            WHERE we.website_id = {{websiteId::uuid}}
                AND we.created_at between l.created_at AND ${getAddIntervalQuery(
									"l.created_at",
									window,
									"minute",
								)}
                AND we.${column} ${operator} {{${i}}}
                AND we.created_at <= {{endDate}}
          )`;
				}

				pv.sumQuery += `\n${startSum}SELECT ${levelNumber} as level, COUNT(DISTINCT(session_id)) as COUNT FROM level${levelNumber}`;
				pv.params.push(paramValue);

				return pv;
			},
			{
				levelOneQuery: "",
				levelQuery: "",
				sumQuery: "",
				params: [],
			},
		);
	}

	return rawQuery(
		`
    ${levelOneQuery}
    ${levelQuery}
    ${sumQuery}
    ORDER BY level;
    `,
		{
			...params,
			...queryParams,
		},
	).then(formatResults(steps));
}

async function clickhouseQuery(
	websiteId: string,
	parameters: FunnelParameters,
	filters: QueryFilters,
): Promise<
	{
		value: string;
		visitors: number;
		dropoff: number;
	}[]
> {
	const { startDate, endDate, window, steps } = parameters;
	const { rawQuery, parseFilters } = clickhouse;
	const { levelOneQuery, levelQuery, sumQuery, stepFilterQuery, params } =
		getFunnelQuery(steps, window);
	const { filterQuery, cohortQuery, queryParams } = parseFilters({
		...filters,
		websiteId,
		startDate,
		endDate,
	});

	function getFunnelQuery(
		steps: { type: string; value: string }[],
		window: number,
	): {
		levelOneQuery: string;
		levelQuery: string;
		sumQuery: string;
		stepFilterQuery: string;
		params: Record<string, string>;
	} {
		return steps.reduce(
			(pv, cv, i) => {
				const levelNumber = i + 1;
				const startSum = i > 0 ? "union all " : "";
				const startFilter = i > 0 ? "OR" : "";
				const isURL = cv.type === "path";
				const column = isURL ? "url_path" : "event_name";

				let operator = "=";
				let paramValue = cv.value;

				if (cv.value.startsWith("*") || cv.value.endsWith("*")) {
					operator = "like";
					paramValue = cv.value.replace(/^\*|\*$/g, "%");
				}

				if (levelNumber === 1) {
					pv.levelOneQuery = `\n
          level1 AS (
            SELECT *
            FROM level0
            WHERE ${column} ${operator} {param${i}:String}
          )`;
				} else {
					pv.levelQuery += `\n
          , level${levelNumber} AS (
            SELECT DISTINCT y.session_id as session_id,
                y.url_path as url_path,
                y.referrer_path as referrer_path,
                y.event_name,
                y.created_at as created_at
            FROM level${i} x
            JOIN level0 y
            on x.session_id = y.session_id
            WHERE y.created_at between x.created_at AND x.created_at + interval ${window} minute
                AND y.${column} ${operator} {param${i}:String}
          )`;
				}

				pv.sumQuery += `\n${startSum}SELECT ${levelNumber} as level, COUNT(DISTINCT(session_id)) as COUNT FROM level${levelNumber}`;
				pv.stepFilterQuery += `${startFilter} ${column} ${operator} {param${i}:String} `;
				pv.params[`param${i}`] = paramValue;

				return pv;
			},
			{
				levelOneQuery: "",
				levelQuery: "",
				sumQuery: "",
				stepFilterQuery: "",
				params: {},
			},
		);
	}

	return rawQuery(
		`
    WITH level0 AS (
      SELECT DISTINCT session_id, url_path, referrer_path, event_name, created_at
      FROM website_event
      ${cohortQuery}
      WHERE (${stepFilterQuery})
        AND website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
       ${filterQuery}
    ),
    ${levelOneQuery}
    ${levelQuery}
    SELECT *
    FROM (
      ${sumQuery} 
    ) ORDER BY level;
    `,
		{
			...params,
			...queryParams,
		},
	).then(formatResults(steps));
}

const formatResults =
	(steps: { type: string; value: string }[]) => (results: unknown) => {
		return steps.map((step: { type: string; value: string }, i: number) => {
			const visitors = Number(results[i]?.COUNT) || 0;
			const previous = Number(results[i - 1]?.COUNT) || 0;
			const dropped = previous > 0 ? previous - visitors : 0;
			const dropoff = 1 - visitors / previous;
			const remaining = visitors / Number(results[0].COUNT);

			return {
				...step,
				visitors,
				previous,
				dropped,
				dropoff,
				remaining,
			};
		});
	};
