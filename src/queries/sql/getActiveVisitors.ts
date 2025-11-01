import { subMinutes } from "date-fns";
import { sql } from "@/lib/db";
import clickhouse from "@/lib/clickhouse";
import { runQuery, CLICKHOUSE, DRIZZLE } from "@/lib/db";

export async function getActiveVisitors(...args: [websiteId: string]) {
	return runQuery({
		[DRIZZLE]: () => relationalQuery(...args),
		[CLICKHOUSE]: () => clickhouseQuery(...args),
	});
}

async function relationalQuery(websiteId: string) {
	const startDate = subMinutes(new Date(), 5);

	const result = await sql`
    SELECT COUNT(DISTINCT session_id) as visitors
    FROM website_event
    WHERE website_id = ${websiteId}::uuid
    AND created_at >= ${startDate}
  `;

	return result[0] ?? null;
}

async function clickhouseQuery(websiteId: string): Promise<{ x: number }> {
	const { rawQuery } = clickhouse;
	const startDate = subMinutes(new Date(), 5);

	const result = await rawQuery(
		`
    select
      count(distinct session_id) as "visitors"
    from website_event
    where website_id = {websiteId:UUID}
      and created_at >= {startDate:DateTime64}
    `,
		{ websiteId, startDate },
	);

	return result[0] ?? null;
}
