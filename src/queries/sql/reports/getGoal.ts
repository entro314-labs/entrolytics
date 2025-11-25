import { getDateSQL, getTimestampDiffSQL, parseFilters, rawQuery } from '@/lib/analytics-utils';
import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db';

import type { QueryFilters } from '@/lib/types';

export interface GoalParameters {
  startDate: Date;
  endDate: Date;
  type: string;
  value: string;
  operator?: string;
  property?: string;
}

export async function getGoal(
  ...args: [websiteId: string, params: GoalParameters, filters: QueryFilters]
) {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: GoalParameters,
  filters: QueryFilters,
) {
  const { startDate, endDate, type, value } = parameters;
  // Using rawQuery FROM analytics-utils
  const eventType = type === 'path' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent;
  const column = type === 'path' ? 'url_path' : 'event_name';
  const { filterQuery, dateQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    value,
    startDate,
    endDate,
    eventType,
  });

  return rawQuery(
    `
    SELECT COUNT(DISTINCT website_event.session_id) as num,
    (
      SELECT COUNT(DISTINCT website_event.session_id)
      FROM website_event
      ${cohortQuery}
      ${joinSessionQuery}
      WHERE website_event.website_id = {{websiteId::uuid}}
      ${dateQuery}
      ${filterQuery}
    ) as total
    FROM website_event
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE website_event.website_id = {{websiteId::uuid}}
      AND ${column} = {{value}}
      ${dateQuery}
      ${filterQuery}
    `,
    queryParams,
  ).then(results => results?.[0]);
}

async function clickhouseQuery(
  websiteId: string,
  parameters: GoalParameters,
  filters: QueryFilters,
) {
  const { startDate, endDate, type, value } = parameters;
  const { rawQuery, parseFilters } = clickhouse;
  const eventType = type === 'path' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent;
  const column = type === 'path' ? 'url_path' : 'event_name';
  const { filterQuery, dateQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    value,
    startDate,
    endDate,
    eventType,
  });

  return rawQuery(
    `
    SELECT COUNT(*) as num,
    (
      SELECT COUNT(DISTINCT session_id)
      FROM website_event
      ${cohortQuery}
      WHERE website_id = {websiteId:UUID}
        ${dateQuery}
        ${filterQuery}
    ) as total
    FROM website_event
    ${cohortQuery}
    WHERE website_id = {websiteId:UUID}
      AND ${column} = {value:String}
      ${dateQuery}
      ${filterQuery}
    `,
    queryParams,
  ).then(results => results?.[0]);
}
