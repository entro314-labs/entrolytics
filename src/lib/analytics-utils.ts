import { sql } from '@/lib/db'
import { QueryFilters } from '@/lib/types'

/**
 * Analytics utility functions for Drizzle ORM
 * Replaces the legacy Prisma utilities
 */

export function getTimestampDiffSQL(startField: string, endField: string): string {
  // PostgreSQL timestamp difference in seconds
  return `EXTRACT(EPOCH FROM (${endField} - ${startField}))`
}

export function getDateSQL(field: string, unit: string, timezone: string): string {
  const tz = timezone === 'utc' ? 'UTC' : timezone

  switch (unit) {
    case 'hour':
      return `date_trunc('hour', ${field} AT TIME ZONE '${tz}') AT TIME ZONE '${tz}'`
    case 'day':
      return `date_trunc('day', ${field} AT TIME ZONE '${tz}') AT TIME ZONE '${tz}'`
    case 'week':
      return `date_trunc('week', ${field} AT TIME ZONE '${tz}') AT TIME ZONE '${tz}'`
    case 'month':
      return `date_trunc('month', ${field} AT TIME ZONE '${tz}') AT TIME ZONE '${tz}'`
    case 'year':
      return `date_trunc('year', ${field} AT TIME ZONE '${tz}') AT TIME ZONE '${tz}'`
    default:
      return `date_trunc('day', ${field} AT TIME ZONE '${tz}') AT TIME ZONE '${tz}'`
  }
}

export function getDateWeeklySQL(field: string, timezone: string): string {
  const tz = timezone === 'utc' ? 'UTC' : timezone

  // Returns format compatible with ClickHouse %w:%H (weekday:hour)
  // PostgreSQL: EXTRACT(DOW FROM timestamp) gives day of week (0=Sunday, 6=Saturday)
  // EXTRACT(HOUR FROM timestamp) gives hour (0-23)
  return `CONCAT(EXTRACT(DOW FROM ${field} AT TIME ZONE '${tz}'), ':', LPAD(EXTRACT(HOUR FROM ${field} AT TIME ZONE '${tz}')::TEXT, 2, '0'))`
}

export interface ParsedFilters {
  filterQuery: string
  joinSessionQuery: string
  cohortQuery: string
  queryParams: Record<string, any>
}

export function parseFilters(
  filters: QueryFilters & {
    websiteId: string
    eventType?: number
  }
): ParsedFilters {
  const {
    websiteId,
    startDate,
    endDate,
    path,
    referrer,
    title,
    query,
    os,
    browser,
    device,
    country,
    region,
    city,
    tag,
    hostname,
    language,
    event,
    eventType,
    segment,
    cohort,
  } = filters

  const queryParams: Record<string, any> = {
    websiteId,
    startDate,
    endDate,
  }

  const filterConditions: string[] = []

  if (eventType !== undefined) {
    filterConditions.push('website_event.event_type = {{eventType}}')
    queryParams.eventType = eventType
  }

  if (path) {
    filterConditions.push('website_event.url_path = {{path}}')
    queryParams.path = path
  }

  if (referrer) {
    filterConditions.push('website_event.referrer_domain = {{referrer}}')
    queryParams.referrer = referrer
  }

  if (title) {
    filterConditions.push('website_event.page_title = {{title}}')
    queryParams.title = title
  }

  if (query) {
    filterConditions.push('website_event.url_query = {{query}}')
    queryParams.query = query
  }

  if (hostname) {
    filterConditions.push('website_event.hostname = {{hostname}}')
    queryParams.hostname = hostname
  }

  if (tag) {
    filterConditions.push('website_event.tag = {{tag}}')
    queryParams.tag = tag
  }

  if (event) {
    filterConditions.push('website_event.event_name = {{event}}')
    queryParams.event = event
  }

  // Session-based filters require JOIN
  const sessionFilters: string[] = []
  let joinSessionQuery = ''

  if (os) {
    sessionFilters.push('session.os = {{os}}')
    queryParams.os = os
  }

  if (browser) {
    sessionFilters.push('session.browser = {{browser}}')
    queryParams.browser = browser
  }

  if (device) {
    sessionFilters.push('session.device = {{device}}')
    queryParams.device = device
  }

  if (country) {
    sessionFilters.push('session.country = {{country}}')
    queryParams.country = country
  }

  if (region) {
    sessionFilters.push('session.region = {{region}}')
    queryParams.region = region
  }

  if (city) {
    sessionFilters.push('session.city = {{city}}')
    queryParams.city = city
  }

  if (language) {
    sessionFilters.push('session.language = {{language}}')
    queryParams.language = language
  }

  if (sessionFilters.length > 0) {
    joinSessionQuery = 'INNER JOIN session ON website_event.session_id = session.session_id'
    filterConditions.push(...sessionFilters)
  }

  // Cohort query (simplified - would need more complex implementation for real cohorts)
  let cohortQuery = ''
  if (segment) {
    // This would need more complex implementation based on segment definitions
    cohortQuery = `INNER JOIN segment_sessions ON website_event.session_id = segment_sessions.session_id AND segment_sessions.segment_id = {{segment}}`
    queryParams.segment = segment
  }

  const filterQuery = filterConditions.length > 0 ? `AND ${filterConditions.join(' AND ')}` : ''

  return {
    filterQuery,
    joinSessionQuery,
    cohortQuery,
    queryParams,
  }
}

/**
 * Execute raw SQL query with parameter substitution
 * Replaces {{param}} style parameters with PostgreSQL $1, $2, etc.
 */
export async function rawQuery(query: string, params: Record<string, any>): Promise<any[]> {
  // Convert {{param}} style to positional parameters
  const paramNames: string[] = []
  const paramValues: any[] = []

  let processedQuery = query.replace(/\{\{(\w+)(?:::(\w+))?\}\}/g, (match, paramName, type) => {
    paramNames.push(paramName)
    paramValues.push(params[paramName])
    return `$${paramValues.length}${type ? `::${type}` : ''}`
  })

  const result = await sql.unsafe(processedQuery, paramValues)
  return result
}

/**
 * Execute raw SQL query with pagination support
 * Adds LIMIT and OFFSET based on filters.page and filters.pageSize
 */
export async function pagedRawQuery(
  query: string,
  params: Record<string, any>,
  filters: QueryFilters & { page?: number; pageSize?: number }
): Promise<any[]> {
  const { page = 1, pageSize = 50 } = filters
  const offset = (page - 1) * pageSize

  // Add pagination to the query
  const paginatedQuery = `${query} LIMIT ${pageSize} OFFSET ${offset}`

  return rawQuery(paginatedQuery, params)
}
