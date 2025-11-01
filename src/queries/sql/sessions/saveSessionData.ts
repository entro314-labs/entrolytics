import { DATA_TYPE } from "@/lib/constants";
import { uuid } from "@/lib/crypto";
import { flattenJSON, getStringValue } from "@/lib/data";
import { db, sessionData as sessionDataTable } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { DynamicData } from "@/lib/types";
import { CLICKHOUSE, DRIZZLE, runQuery } from "@/lib/db";
import kafka from "@/lib/kafka";
import clickhouse from "@/lib/clickhouse";

export interface SaveSessionDataArgs {
	websiteId: string;
	sessionId: string;
	sessionData: DynamicData;
	distinctId?: string;
	createdAt?: Date;
}

export async function saveSessionData(data: SaveSessionDataArgs) {
	return runQuery({
		[DRIZZLE]: () => relationalQuery(data),
		[CLICKHOUSE]: () => clickhouseQuery(data),
	});
}

export async function relationalQuery({
	websiteId,
	sessionId,
	sessionData,
	distinctId,
	createdAt,
}: SaveSessionDataArgs) {
	const jsonKeys = flattenJSON(sessionData);

	const flattenedData = jsonKeys.map((a) => ({
		sessionDataId: uuid(),
		websiteId,
		sessionId,
		dataKey: a.key,
		stringValue: getStringValue(a.value, a.dataType),
		numberValue: a.dataType === DATA_TYPE.number ? a.value : null,
		dateValue: a.dataType === DATA_TYPE.date ? new Date(a.value) : null,
		dataType: a.dataType,
		distinctId,
		createdAt,
	}));

	const existing = await db
		.select({
			sessionDataId: sessionDataTable.sessionDataId,
			sessionId: sessionDataTable.sessionId,
			dataKey: sessionDataTable.dataKey,
		})
		.from(sessionDataTable)
		.where(
			and(
				eq(sessionDataTable.websiteId, websiteId),
				eq(sessionDataTable.sessionId, sessionId),
			),
		);

	for (const data of flattenedData) {
		const { sessionId: currentSessionId, dataKey, ...props } = data;
		const record = existing.find(
			(e) => e.sessionId === currentSessionId && e.dataKey === dataKey,
		);

		if (record) {
			await db
				.update(sessionDataTable)
				.set(props)
				.where(eq(sessionDataTable.sessionDataId, record.sessionDataId));
		} else {
			await db.insert(sessionDataTable).values(data);
		}
	}
}

async function clickhouseQuery({
	websiteId,
	sessionId,
	sessionData,
	distinctId,
	createdAt,
}: SaveSessionDataArgs) {
	const { insert, getUTCString } = clickhouse;
	const { sendMessage } = kafka;

	const jsonKeys = flattenJSON(sessionData);

	const messages = jsonKeys.map(({ key, value, dataType }) => {
		return {
			website_id: websiteId,
			session_id: sessionId,
			data_key: key,
			data_type: dataType,
			string_value: getStringValue(value, dataType),
			number_value: dataType === DATA_TYPE.number ? value : null,
			date_value: dataType === DATA_TYPE.date ? getUTCString(value) : null,
			distinct_id: distinctId,
			created_at: getUTCString(createdAt),
		};
	});

	if (kafka.enabled) {
		await sendMessage("session_data", messages);
	} else {
		await insert("session_data", messages);
	}
}
