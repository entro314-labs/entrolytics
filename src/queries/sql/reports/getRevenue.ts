import { getDateSQL, getTimestampDiffSQL, parseFilters, rawQuery } from '@/lib/analytics-utils';
import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db';

import type { QueryFilters } from '@/lib/types';

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
}

export async function getRevenue(
  ...args: [websiteId: string, parameters: RevenuParameters, filters: QueryFilters]
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
  const { startDate, endDate, currency, unit = 'day' } = parameters;
  const { timezone = 'UTC' } = filters;
  // Using rawQuery FROM analytics-utils
  const { queryParams, filterQuery, cohortQuery, joinSessionQuery } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    currency,
  });

  // Conditional JOIN - only include when filters are applied for better performance
  const joinQuery = filterQuery
    ? `JOIN website_event
      on website_event.website_id = revenue.website_id
        AND website_event.session_id = revenue.session_id
        AND website_event.event_id = revenue.event_id
        AND website_event.website_id = {{websiteId::uuid}}
        AND website_event.created_at between {{startDate}} AND {{endDate}}`
    : '';

  const chart = await rawQuery(
    `
    SELECT
      revenue.event_name x,
      ${getDateSQL('revenue.created_at', unit, timezone)} t,
      SUM(revenue.revenue) y
    FROM revenue
    ${joinQuery}
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE revenue.website_id = {{websiteId::uuid}}
      AND revenue.created_at between {{startDate}} AND {{endDate}}
      AND revenue.currency ilike {{currency}}
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
      SUM(revenue.revenue) value
    FROM revenue
    ${joinQuery}
    JOIN session
      on session.website_id = revenue.website_id
        AND session.session_id = revenue.session_id
    ${cohortQuery}
    WHERE revenue.website_id = {{websiteId::uuid}}
      AND revenue.created_at between {{startDate}} AND {{endDate}}
      AND revenue.currency ilike {{currency}}
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
    ${joinQuery}
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE revenue.website_id = {{websiteId::uuid}}
      AND revenue.created_at between {{startDate}} AND {{endDate}}
      AND revenue.currency ilike {{currency}}
      ${filterQuery}
  `,
    queryParams,
  ).then(result => result?.[0]);

  total.average = total.COUNT > 0 ? Number(total.SUM) / Number(total.COUNT) : 0;

  return { chart, country, total };
}

async function clickhouseQuery(
  websiteId: string,
  parameters: RevenuParameters,
  filters: QueryFilters,
): Promise<RevenueResult> {
  const { startDate, endDate, unit = 'day', currency } = parameters;
  const { timezone = 'UTC' } = filters;
  const { getDateSQL, rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    currency,
  });

  // Conditional JOIN - only include when filters are applied for better performance
  const joinQuery = filterQuery
    ? `join website_event
   on website_event.website_id = website_revenue.website_id
    and website_event.session_id = website_revenue.session_id
    and website_event.event_id = website_revenue.event_id
    and website_event.website_id = {websiteId:UUID}
    and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}`
    : '';

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
      ${getDateSQL('website_revenue.created_at', unit, timezone)} t,
      SUM(website_revenue.revenue) y
    FROM website_revenue
    ${joinQuery}
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
    ${joinQuery}
    ${cohortQuery}
    WHERE website_revenue.website_id = {websiteId:UUID}
      AND website_revenue.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
      AND website_revenue.currency = {currency:String}
      ${filterQuery}
    `,
    queryParams,
  ).then(result => result?.[0]);

  total.average = total.COUNT > 0 ? Number(total.SUM) / Number(total.COUNT) : 0;

  return { chart, country, total };
}
