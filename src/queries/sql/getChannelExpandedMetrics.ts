import clickhouse from '@/lib/clickhouse'
import {
  EMAIL_DOMAINS,
  EVENT_TYPE,
  PAID_AD_PARAMS,
  SEARCH_DOMAINS,
  SHOPPING_DOMAINS,
  SOCIAL_DOMAINS,
  VIDEO_DOMAINS,
} from '@/lib/constants'
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db'
import { getTimestampDiffSQL, getDateSQL, parseFilters, rawQuery } from '@/lib/analytics-utils'

import { QueryFilters } from '@/lib/types'

export interface ChannelExpandedMetricsParameters {
  limit?: number | string
  offset?: number | string
}

export interface ChannelExpandedMetricsData {
  name: string
  pageviews: number
  visitors: number
  visits: number
  bounces: number
  totaltime: number
}

export async function getChannelExpandedMetrics(
  ...args: [websiteId: string, filters?: QueryFilters]
): Promise<ChannelExpandedMetricsData[]> {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  })
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters
): Promise<ChannelExpandedMetricsData[]> {
  // Using rawQuery FROM analytics-utils
  const { queryParams, filterQuery, joinSessionQuery, cohortQuery, dateQuery } = parseFilters({
    ...filters,
    websiteId,
    eventType: EVENT_TYPE.pageView,
  })

  return rawQuery(
    `
    WITH channels as (
      SELECT CASE WHEN ${toPostgresPositionClause('utm_medium', ['cp', 'ppc', 'retargeting', 'paid'])} THEN 'paid' ELSE 'organic' END prefix,
          CASE
          WHEN referrer_domain = '' AND url_query = '' THEN 'direct'
          WHEN ${toPostgresPositionClause('url_query', PAID_AD_PARAMS)} THEN 'paidAds'
          WHEN ${toPostgresPositionClause('utm_medium', ['referral', 'app', 'link'])} THEN 'referral'
          WHEN position(utm_medium, 'affiliate') > 0 THEN 'affiliate'
          WHEN position(utm_medium, 'sms') > 0 OR position(utm_source, 'sms') > 0 THEN 'sms'
          WHEN ${toPostgresPositionClause('referrer_domain', SEARCH_DOMAINS)} OR position(utm_medium, 'organic') > 0 THEN concat(prefix, 'Search')
          WHEN ${toPostgresPositionClause('referrer_domain', SOCIAL_DOMAINS)} THEN concat(prefix, 'Social')
          WHEN ${toPostgresPositionClause('referrer_domain', EMAIL_DOMAINS)} OR position(utm_medium, 'mail') > 0 THEN 'email'
          WHEN ${toPostgresPositionClause('referrer_domain', SHOPPING_DOMAINS)} OR position(utm_medium, 'shop') > 0 THEN concat(prefix, 'Shopping')
          WHEN ${toPostgresPositionClause('referrer_domain', VIDEO_DOMAINS)} OR position(utm_medium, 'video') > 0 THEN concat(prefix, 'Video')
          ELSE '' END AS x,
        COUNT(DISTINCT session_id) y
      FROM website_event
      ${cohortQuery}
      ${joinSessionQuery}
      WHERE website_id = {{websiteId::uuid}}
        ${dateQuery}
        ${filterQuery}
      GROUP BY 1, 2
      ORDER BY y desc)

    SELECT x, SUM(y) y
    FROM channels
    WHERE x != ''
    GROUP BY x
    ORDER BY y desc;
    `,
    queryParams
  )
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters
): Promise<ChannelExpandedMetricsData[]> {
  const { rawQuery, parseFilters } = clickhouse
  const { queryParams, filterQuery, cohortQuery } = parseFilters({
    ...filters,
    websiteId,
    eventType: EVENT_TYPE.pageView,
  })

  return rawQuery(
    `
    SELECT
      name,
      SUM(t.c) as "pageviews",
      uniq(t.session_id) as "visitors",
      uniq(t.visit_id) as "visits",
      SUM(if(t.c = 1, 1, 0)) as "bounces",
      SUM(max_time-min_time) as "totaltime"
    FROM (
      SELECT CASE WHEN multiSearchAny(utm_medium, ['cp', 'ppc', 'retargeting', 'paid']) != 0 THEN 'paid' ELSE 'organic' END prefix,
          CASE
          WHEN referrer_domain = '' AND url_query = '' THEN 'direct'
          WHEN multiSearchAny(url_query, [${toClickHouseStringArray(
            PAID_AD_PARAMS
          )}]) != 0 THEN 'paidAds'
          WHEN multiSearchAny(utm_medium, ['referral', 'app','link']) != 0 THEN 'referral'
          WHEN position(utm_medium, 'affiliate') > 0 THEN 'affiliate'
          WHEN position(utm_medium, 'sms') > 0 OR position(utm_source, 'sms') > 0 THEN 'sms'
          WHEN multiSearchAny(referrer_domain, [${toClickHouseStringArray(
            SEARCH_DOMAINS
          )}]) != 0 OR position(utm_medium, 'organic') > 0 THEN concat(prefix, 'Search')
          WHEN multiSearchAny(referrer_domain, [${toClickHouseStringArray(
            SOCIAL_DOMAINS
          )}]) != 0 THEN concat(prefix, 'Social')
          WHEN multiSearchAny(referrer_domain, [${toClickHouseStringArray(
            EMAIL_DOMAINS
          )}]) != 0 OR position(utm_medium, 'mail') > 0 THEN 'email'
          WHEN multiSearchAny(referrer_domain, [${toClickHouseStringArray(
            SHOPPING_DOMAINS
          )}]) != 0 OR position(utm_medium, 'shop') > 0 THEN concat(prefix, 'Shopping')
          WHEN multiSearchAny(referrer_domain, [${toClickHouseStringArray(
            VIDEO_DOMAINS
          )}]) != 0 OR position(utm_medium, 'video') > 0 THEN concat(prefix, 'Video')
          ELSE '' END AS name,
        session_id,
        visit_id,
        COUNT(*) c,
        MIN(created_at) min_time,
        MAX(created_at) max_time
      FROM website_event
      ${cohortQuery}
      WHERE website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
        AND name != ''
        ${filterQuery}
      GROUP BY prefix, name, session_id, visit_id
    ) as t
    GROUP BY name 
    ORDER BY visitors desc, visits desc;
    `,
    queryParams
  )
}

function toClickHouseStringArray(arr: string[]): string {
  return arr.map((p) => `'${p.replace(/'/g, "\\'")}'`).JOIN(', ')
}

function toPostgresPositionClause(column: string, arr: string[]) {
  return arr.map((val) => `position(${column}, '${val.replace(/'/g, "''")}') > 0`).JOIN(' OR\n  ')
}
