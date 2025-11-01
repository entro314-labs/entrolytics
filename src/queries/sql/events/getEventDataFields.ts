import clickhouse from "@/lib/clickhouse";
import { CLICKHOUSE, DRIZZLE, runQuery } from "@/lib/db";
import {
	getTimestampDiffSQL,
	getDateSQL,
	parseFilters,
	rawQuery,
} from "@/lib/analytics-utils";

import { QueryFilters } from "@/lib/types";

export async function getEventDataFields(
	...args: [websiteId: string, filters: QueryFilters]
) {
	return runQuery({
		[DRIZZLE]: () => relationalQuery(...args),
		[CLICKHOUSE]: () => clickhouseQuery(...args),
	});
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
	// Using rawQuery FROM analytics-utils
	const { filterQuery, cohortQuery, joinSessionQuery, queryParams } =
		parseFilters({
			...filters,
			websiteId,
		});

	return rawQuery(
		`
    SELECT
      data_key as "propertyName",
      data_type as "dataType",
      CASE 
        WHEN data_type = 2 THEN replace(string_value, '.0000', '') 
        WHEN data_type = 4 THEN ${getDateSQL("date_value", "hour", "UTC")}
        ELSE string_value
      END as "value",
      COUNT(*) as "total"
    FROM event_data
    JOIN website_event on website_event.event_id = event_data.website_event_id
      AND website_event.website_id = {{websiteId::uuid}}
      AND website_event.created_at between {{startDate}} AND {{endDate}}
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE event_data.website_id = {{websiteId::uuid}}
      AND event_data.created_at between {{startDate}} AND {{endDate}}
    ${filterQuery}
    GROUP BY data_key, data_type, value
    ORDER BY 2 desc
    limit 100
    `,
		queryParams,
	);
}

async function clickhouseQuery(
	websiteId: string,
	filters: QueryFilters,
): Promise<
	{
		propertyName: string;
		dataType: number;
		propertyValue: string;
		total: number;
	}[]
> {
	const { rawQuery, parseFilters } = clickhouse;
	const { filterQuery, cohortQuery, queryParams } = parseFilters({
		...filters,
		websiteId,
	});

	return rawQuery(
		`
    SELECT
      data_key as propertyName,
      data_type as dataType,
      multiIf(data_type = 2, replaceAll(string_value, '.0000', ''),
              data_type = 4, toString(date_trunc('hour', date_value)),
              string_value) as "value",
      COUNT(*) as "total"
    FROM event_data website_event
    ${cohortQuery}
    WHERE website_id = {websiteId:UUID}
      AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
    ${filterQuery}
    GROUP BY data_key, data_type, value
    ORDER BY 2 desc
    limit 100
    `,
		queryParams,
	);
}
