import clickhouse from '@/lib/clickhouse'
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db'
import {
  getTimestampDiffSQL,
  getDateSQL,
  parseFilters,
  rawQuery,
  pagedRawQuery,
} from '@/lib/analytics-utils'
import { EVENT_COLUMNS } from '@/lib/constants'

import { QueryFilters } from '@/lib/types'

const FUNCTION_NAME = 'getWebsiteSessions'

export async function getWebsiteSessions(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  })
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  // Using pagedRawQuery and parseFilters from analytics-utils
  const { search } = filters
  const { filterQuery, dateQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    search: search ? `%${search}%` : undefined,
  })

  const searchQuery = search
    ? `AND (distinct_id ilike {{search}}
           OR city ilike {{search}}
           OR browser ilike {{search}}
           OR os ilike {{search}}
           OR device ilike {{search}})`
    : ''

  return pagedRawQuery(
    `
    SELECT
      session.session_id as "id",
      session.website_id as "websiteId",
      website_event.hostname,
      session.browser,
      session.os,
      session.device,
      session.screen,
      session.language,
      session.country,
      session.region,
      session.city,
      MIN(website_event.created_at) as "firstAt",
      MAX(website_event.created_at) as "lastAt",
      COUNT(DISTINCT website_event.visit_id) as "visits",
      SUM(CASE WHEN website_event.event_type = 1 THEN 1 ELSE 0 END) as "views",
      MAX(website_event.created_at) as "createdAt"
    FROM website_event
    ${cohortQuery}
    JOIN session on session.session_id = website_event.session_id
      AND session.website_id = website_event.website_id
    WHERE website_event.website_id = {{websiteId::uuid}}
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
    GROUP BY session.session_id,
      session.website_id,
      website_event.hostname,
      session.browser,
      session.os,
      session.device,
      session.screen,
      session.language,
      session.country,
      session.region,
      session.city
    ORDER BY MAX(website_event.created_at) desc
    `,
    queryParams,
    filters,
    FUNCTION_NAME
  )
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters) {
  const { pagedRawQuery, parseFilters, getDateStringSQL } = clickhouse
  const { search } = filters
  const { filterQuery, dateQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  })

  const searchQuery = search
    ? `AND ((positionCaseInsensitive(distinct_id, {search:String}) > 0)
           OR (positionCaseInsensitive(city, {search:String}) > 0)
           OR (positionCaseInsensitive(browser, {search:String}) > 0)
           OR (positionCaseInsensitive(os, {search:String}) > 0)
           OR (positionCaseInsensitive(device, {search:String}) > 0))`
    : ''

  let sql = ''

  if (
    filters &&
    typeof filters === 'object' &&
    EVENT_COLUMNS.some((item) => Object.keys(filters).includes(item))
  ) {
    sql = `
    SELECT
      session_id as id,
      website_id as websiteId,
      browser,
      os,
      device,
      screen,
      language,
      country,
      region,
      city,
      ${getDateStringSQL('MIN(created_at)')} as firstAt,
      ${getDateStringSQL('MAX(created_at)')} as lastAt,
      uniq(visit_id) as visits,
      sumIf(1, event_type = 1) as views,
      lastAt as createdAt
    FROM website_event
    ${cohortQuery}
    WHERE website_id = {websiteId:UUID}
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
    GROUP BY session_id, website_id, browser, os, device, screen, language, country, region, city
    ORDER BY lastAt desc
    `
  } else {
    sql = `
    SELECT
      session_id as id,
      website_id as websiteId,
      hostname,
      browser,
      os,
      device,
      screen,
      language,
      country,
      region,
      city,
      ${getDateStringSQL('MIN(min_time)')} as firstAt,
      ${getDateStringSQL('MAX(max_time)')} as lastAt,
      uniq(visit_id) as visits,
      sumIf(views, event_type = 1) as views,
      lastAt as createdAt
    FROM website_event_stats_hourly as website_event
    ${cohortQuery}
    WHERE website_id = {websiteId:UUID}
    ${dateQuery}
    ${filterQuery}
    ${searchQuery}
    GROUP BY session_id, website_id, hostname, browser, os, device, screen, language, country, region, city
    ORDER BY lastAt desc
    `
  }

  return pagedRawQuery(sql, queryParams, filters, FUNCTION_NAME)
}
