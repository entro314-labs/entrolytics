import clickhouse from '@/lib/clickhouse'
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db'
import {
  getTimestampDiffSQL,
  getDateSQL,
  parseFilters,
  rawQuery,
  getDayDiffQuery,
  getCastColumnQuery,
} from '@/lib/analytics-utils'

import { QueryFilters } from '@/lib/types'

export interface RetentionParameters {
  startDate: Date
  endDate: Date
  timezone?: string
}

export interface RetentionResult {
  date: string
  day: number
  visitors: number
  returnVisitors: number
  percentage: number
}

export async function getRetention(
  ...args: [websiteId: string, parameters: RetentionParameters, filters: QueryFilters]
) {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  })
}

async function relationalQuery(
  websiteId: string,
  parameters: RetentionParameters,
  filters: QueryFilters
): Promise<RetentionResult[]> {
  const { startDate, endDate, timezone } = parameters
  // Using rawQuery FROM analytics-utils
  const unit = 'day'

  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    timezone,
  })

  return rawQuery(
    `
    WITH cohort_items AS (
      SELECT
        MIN(${getDateSQL('website_event.created_at', unit, timezone)}) as cohort_date,
        website_event.session_id
      FROM website_event
      ${cohortQuery}
      ${joinSessionQuery}
      WHERE website_event.website_id = {{websiteId::uuid}}
        AND website_event.created_at between {{startDate}} AND {{endDate}}
        ${filterQuery}
      GROUP BY website_event.session_id
    ),
    user_activities AS (
      SELECT DISTINCT
        website_event.session_id,
        ${getDayDiffQuery(getDateSQL('website_event.created_at', unit, timezone), 'cohort_items.cohort_date')} as day_number
      FROM website_event
      JOIN cohort_items
      on website_event.session_id = cohort_items.session_id
      WHERE website_event.website_id = {{websiteId::uuid}}
          AND website_event.created_at between {{startDate}} AND {{endDate}}
      ),
    cohort_size as (
      SELECT cohort_date,
        COUNT(*) as visitors
      FROM cohort_items
      GROUP BY 1
      ORDER BY 1
    ),
    cohort_date as (
      SELECT
        c.cohort_date,
        a.day_number,
        COUNT(*) as visitors
      FROM user_activities a
      JOIN cohort_items c
      on a.session_id = c.session_id
      GROUP BY 1, 2
    )
    SELECT
      c.cohort_date as date,
      c.day_number as day,
      s.visitors,
      c.visitors as "returnVisitors",
      ${getCastColumnQuery('c.visitors', 'float')} * 100 / s.visitors  as percentage
    FROM cohort_date c
    JOIN cohort_size s
    on c.cohort_date = s.cohort_date
    WHERE c.day_number <= 31
    ORDER BY 1, 2`,
    queryParams
  )
}

async function clickhouseQuery(
  websiteId: string,
  parameters: RetentionParameters,
  filters: QueryFilters
): Promise<RetentionResult[]> {
  const { startDate, endDate, timezone } = parameters
  const { getDateSQL, rawQuery, parseFilters } = clickhouse
  const unit = 'day'

  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    timezone,
  })

  return rawQuery(
    `
    WITH cohort_items AS (
      SELECT
        MIN(${getDateSQL('created_at', unit, timezone)}) as cohort_date,
        session_id
      FROM website_event
      ${cohortQuery}
      WHERE website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
        ${filterQuery}
      GROUP BY session_id
    ),
    user_activities AS (
      SELECT DISTINCT
        website_event.session_id,
        toInt32((${getDateSQL('created_at', unit, timezone)} - cohort_items.cohort_date) / 86400) as day_number
      FROM website_event
      JOIN cohort_items
      on website_event.session_id = cohort_items.session_id
      WHERE website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
    ),
    cohort_size as (
      SELECT cohort_date,
        COUNT(*) as visitors
      FROM cohort_items
      GROUP BY 1
      ORDER BY 1
    ),
    cohort_date as (
      SELECT
        c.cohort_date,
        a.day_number,
        COUNT(*) as visitors
      FROM user_activities a
      JOIN cohort_items c
      on a.session_id = c.session_id
      GROUP BY 1, 2
    )
    SELECT
      c.cohort_date as date,
      c.day_number as day,
      s.visitors as visitors,
      c.visitors returnVisitors,
      c.visitors * 100 / s.visitors as percentage
    FROM cohort_date c
    JOIN cohort_size s
    on c.cohort_date = s.cohort_date
    WHERE c.day_number <= 31
    ORDER BY 1, 2`,
    queryParams
  )
}
