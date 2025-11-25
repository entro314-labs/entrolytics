import { getDateSQL, getTimestampDiffSQL, parseFilters, rawQuery } from '@/lib/analytics-utils';
import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db';

export async function getSessionData(...args: [websiteId: string, sessionId: string]) {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, sessionId: string) {
  // Using rawQuery FROM analytics-utils

  return rawQuery(
    `
    SELECT
        website_id as "websiteId",
        session_id as "sessionId",
        data_key as "dataKey",
        data_type as "dataType",
        replace(string_value, '.0000', '') as "stringValue",
        number_value as "numberValue",
        date_value as "dateValue",
        created_at as "createdAt"
    FROM session_data
    WHERE website_id = {{websiteId::uuid}}
      AND session_id = {{sessionId::uuid}}
    ORDER BY data_key asc
    `,
    { websiteId, sessionId },
  );
}

async function clickhouseQuery(websiteId: string, sessionId: string) {
  const { rawQuery } = clickhouse;

  return rawQuery(
    `
    SELECT
        website_id as websiteId,
        session_id as sessionId,
        data_key as dataKey,
        data_type as dataType,
        replace(string_value, '.0000', '')  as stringValue,
        number_value as numberValue,
        date_value as dateValue,
        created_at as createdAt
    FROM session_data final
    WHERE website_id = {websiteId:UUID}
    AND session_id = {sessionId:UUID}
    ORDER BY data_key asc
    `,
    { websiteId, sessionId },
  );
}
