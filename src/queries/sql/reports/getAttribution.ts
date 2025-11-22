import clickhouse from '@/lib/clickhouse'
import { EVENT_TYPE } from '@/lib/constants'
import { CLICKHOUSE, DRIZZLE, runQuery } from '@/lib/db'
import { getTimestampDiffSQL, getDateSQL, parseFilters, rawQuery } from '@/lib/analytics-utils'

import { QueryFilters } from '@/lib/types'

export interface AttributionParameters {
  startDate: Date
  endDate: Date
  model: string
  type: string
  step: string
  currency?: string
}

export interface AttributionResult {
  referrer: { name: string; value: number }[]
  paidAds: { name: string; value: number }[]
  utm_source: { name: string; value: number }[]
  utm_medium: { name: string; value: number }[]
  utm_campaign: { name: string; value: number }[]
  utm_content: { name: string; value: number }[]
  utm_term: { name: string; value: number }[]
  total: { pageviews: number; visitors: number; visits: number }
}

export async function getAttribution(
  ...args: [websiteId: string, parameters: AttributionParameters, filters: QueryFilters]
) {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  })
}

async function relationalQuery(
  websiteId: string,
  parameters: AttributionParameters,
  filters: QueryFilters
): Promise<AttributionResult> {
  const { model, type, currency } = parameters
  // Using rawQuery FROM analytics-utils
  const eventType = type === 'path' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent
  const column = type === 'path' ? 'url_path' : 'event_name'
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    ...parameters,
    websiteId,
    eventType,
  })

  function getUTMQuery(utmColumn: string) {
    return `
    SELECT 
        coalesce(we.${utmColumn}, '') name,
        ${currency ? 'SUM(e.value)' : 'COUNT(DISTINCT we.session_id)'} value
    FROM model m
    JOIN website_event we
    on we.created_at = m.created_at
        AND we.session_id = m.session_id
    ${currency ? 'JOIN events e on e.session_id = m.session_id' : ''}
    WHERE we.website_id = {{websiteId::uuid}}
          AND we.created_at between {{startDate}} AND {{endDate}}
    ${currency ? '' : `AND we.${utmColumn} != ''`}  
    GROUP BY 1
    ORDER BY 2 desc
    limit 20`
  }

  const eventQuery = `WITH events AS (
        SELECT DISTINCT
            website_event.session_id,
            MAX(website_event.created_at) max_dt
        FROM website_event
        ${cohortQuery}
        ${joinSessionQuery}
        WHERE website_event.website_id = {{websiteId::uuid}}
          AND website_event.created_at between {{startDate}} AND {{endDate}}
          AND website_event.${column} = {{step}}
          ${filterQuery}
        GROUP BY 1),`

  const revenueEventQuery = `WITH events AS (
        SELECT
          revenue.session_id,
          MAX(revenue.created_at) max_dt,
          SUM(revenue.revenue) value
        FROM revenue
        JOIN website_event
          on website_event.website_id = revenue.website_id
            AND website_event.session_id = revenue.session_id
            AND website_event.event_id = revenue.event_id
            AND website_event.website_id = {{websiteId::uuid}}
            AND website_event.created_at between {{startDate}} AND {{endDate}}
        ${cohortQuery}
        ${joinSessionQuery}
        WHERE revenue.website_id = {{websiteId::uuid}}
          AND revenue.created_at between {{startDate}} AND {{endDate}}
          AND revenue.${column} = {{step}}
          AND revenue.currency = {{currency}}
          ${filterQuery}
        GROUP BY 1),`

  function getModelQuery(model: string) {
    return model === 'first-click'
      ? `\n 
    model AS (SELECT e.session_id,
        MIN(we.created_at) created_at
    FROM events e
    JOIN website_event we
    on we.session_id = e.session_id
    WHERE we.website_id = {{websiteId::uuid}}
          AND we.created_at between {{startDate}} AND {{endDate}}
    GROUP BY e.session_id)`
      : `\n 
    model AS (SELECT e.session_id,
        MAX(we.created_at) created_at
    FROM events e
    JOIN website_event we
    on we.session_id = e.session_id
    WHERE we.website_id = {{websiteId::uuid}}
          AND we.created_at between {{startDate}} AND {{endDate}} 
          AND we.created_at < e.max_dt
    GROUP BY e.session_id)`
  }

  const referrerRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    SELECT coalesce(we.referrer_domain, '') name,
        ${currency ? 'SUM(e.value)' : 'COUNT(DISTINCT we.session_id)'} value
    FROM model m
    JOIN website_event we
    on we.created_at = m.created_at
        AND we.session_id = m.session_id
    JOIN session s
    on s.session_id = m.session_id
    ${currency ? 'JOIN events e on e.session_id = m.session_id' : ''}
    WHERE we.website_id = {{websiteId::uuid}}
          AND we.created_at between {{startDate}} AND {{endDate}}
    ${
      currency
        ? ''
        : `AND we.referrer_domain != hostname
      AND we.referrer_domain != ''`
    }  
    GROUP BY 1
    ORDER BY 2 desc
    limit 20
    `,
    queryParams
  )

  const paidAdsres = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)},

    results AS (
    SELECT CASE
            WHEN coalesce(gclid, '') != '' THEN 'Google Ads' 
            WHEN coalesce(fbclid, '') != '' THEN 'Facebook / Meta' 
            WHEN coalesce(msclkid, '') != '' THEN 'Microsoft Ads' 
            WHEN coalesce(ttclid, '') != '' THEN 'TikTok Ads' 
            WHEN coalesce(li_fat_id, '') != '' THEN 'LinkedIn Ads' 
            WHEN coalesce(twclid, '') != '' THEN 'Twitter Ads (X)'
            ELSE ''
          END name,
        ${currency ? 'SUM(e.value)' : 'COUNT(DISTINCT we.session_id)'} value
    FROM model m
    JOIN website_event we
    on we.created_at = m.created_at
        AND we.session_id = m.session_id
    ${currency ? 'JOIN events e on e.session_id = m.session_id' : ''}
    WHERE we.website_id = {{websiteId::uuid}}
          AND we.created_at between {{startDate}} AND {{endDate}}
    GROUP BY 1
    ORDER BY 2 desc
    limit 20)
    SELECT * 
    FROM results
    ${currency ? '' : `WHERE name != ''`}
    `,
    queryParams
  )

  const sourceRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_source')}
    `,
    queryParams
  )

  const mediumRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_medium')}
    `,
    queryParams
  )

  const campaignRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_campaign')}
    `,
    queryParams
  )

  const contentRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_content')}
    `,
    queryParams
  )

  const termRes = await rawQuery(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_term')}
    `,
    queryParams
  )

  const totalRes = await rawQuery(
    `
    SELECT
        COUNT(*) as "pageviews",
        COUNT(DISTINCT website_event.session_id) as "visitors",
        COUNT(DISTINCT website_event.visit_id) as "visits"
    FROM website_event
    ${joinSessionQuery}
    ${cohortQuery}
    WHERE website_event.website_id = {{websiteId::uuid}}
        AND website_event.created_at between {{startDate}} AND {{endDate}}
        AND website_event.${column} = {{step}}
        ${filterQuery}
    `,
    queryParams
  ).then((result) => result?.[0])

  return {
    referrer: referrerRes,
    paidAds: paidAdsres,
    utm_source: sourceRes,
    utm_medium: mediumRes,
    utm_campaign: campaignRes,
    utm_content: contentRes,
    utm_term: termRes,
    total: totalRes,
  }
}

async function clickhouseQuery(
  websiteId: string,
  parameters: AttributionParameters,
  filters: QueryFilters
): Promise<AttributionResult> {
  const { model, type, currency } = parameters
  const { rawQuery, parseFilters } = clickhouse
  const eventType = type === 'path' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent
  const column = type === 'path' ? 'url_path' : 'event_name'
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    ...parameters,
    websiteId,
    eventType,
  })

  function getUTMQuery(utmColumn: string) {
    return `
      SELECT 
          we.${utmColumn} name,
          ${currency ? 'SUM(e.value)' : 'uniqExact(we.session_id)'} value
      FROM model m
      JOIN website_event we
      on we.created_at = m.created_at
          AND we.session_id = m.session_id
      ${currency ? 'JOIN events e on e.session_id = m.session_id' : ''}
      WHERE we.website_id = {websiteId:UUID}
            AND we.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
      ${currency ? '' : `AND we.${utmColumn} != ''`}  
      GROUP BY 1
      ORDER BY 2 desc
      limit 20
    `
  }

  function getModelQuery(model: string) {
    if (model === 'first-click') {
      return ` 
        model AS (SELECT e.session_id,
            MIN(we.created_at) created_at
        FROM events e
        JOIN website_event we
        on we.session_id = e.session_id
        WHERE we.website_id = {websiteId:UUID}
          AND we.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
        GROUP BY e.session_id)
      `
    }

    return `
      model AS (SELECT e.session_id,
          MAX(we.created_at) created_at
      FROM events e
      JOIN website_event we
      on we.session_id = e.session_id
      WHERE we.website_id = {websiteId:UUID}
        AND we.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
        AND we.created_at < e.max_dt
      GROUP BY e.session_id)
      `
  }

  const eventQuery = `WITH events AS (
        SELECT DISTINCT
            session_id,
            MAX(created_at) max_dt
        FROM website_event
        ${cohortQuery}
        WHERE website_id = {websiteId:UUID}
          AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
          AND ${column} = {step:String}
          ${filterQuery}
        GROUP BY 1),`

  const revenueEventQuery = `WITH events AS (
          SELECT
              website_revenue.session_id,
              MAX(website_revenue.created_at) max_dt,
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
            AND website_revenue.${column} = {step:String}
            AND website_revenue.currency = {currency:String}
            ${filterQuery}
          GROUP BY 1),`

  const referrerRes = await rawQuery<
    {
      name: string
      value: number
    }[]
  >(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    SELECT we.referrer_domain name,
        ${currency ? 'SUM(e.value)' : 'uniqExact(we.session_id)'} value
    FROM model m
    JOIN website_event we
    on we.created_at = m.created_at
        AND we.session_id = m.session_id
    ${currency ? 'JOIN events e on e.session_id = m.session_id' : ''}
    WHERE we.website_id = {websiteId:UUID}
          AND we.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
    ${
      currency
        ? ''
        : `AND we.referrer_domain != hostname
      AND we.referrer_domain != ''`
    }  
    GROUP BY 1
    ORDER BY 2 desc
    limit 20
    `,
    queryParams
  )

  const paidAdsres = await rawQuery<
    {
      name: string
      value: number
    }[]
  >(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    SELECT multiIf(gclid != '', 'Google Ads', 
                   fbclid != '', 'Facebook / Meta', 
                   msclkid != '', 'Microsoft Ads', 
                   ttclid != '', 'TikTok Ads', 
                   li_fat_id != '', 'LinkedIn Ads', 
                   twclid != '', 'Twitter Ads (X)','') name,
        ${currency ? 'SUM(e.value)' : 'uniqExact(we.session_id)'} value
    FROM model m
    JOIN website_event we
    on we.created_at = m.created_at
        AND we.session_id = m.session_id
    ${currency ? 'JOIN events e on e.session_id = m.session_id' : ''}
    WHERE we.website_id = {websiteId:UUID}
      AND we.created_at between {startDate:DateTime64} AND {endDate:DateTime64}
    ${currency ? '' : `AND name != ''`}
    GROUP BY 1
    ORDER BY 2 desc
    limit 20
    `,
    queryParams
  )

  const sourceRes = await rawQuery<
    {
      name: string
      value: number
    }[]
  >(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_source')}
    `,
    queryParams
  )

  const mediumRes = await rawQuery<
    {
      name: string
      value: number
    }[]
  >(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_medium')}
    `,
    queryParams
  )

  const campaignRes = await rawQuery<
    {
      name: string
      value: number
    }[]
  >(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_campaign')}
    `,
    queryParams
  )

  const contentRes = await rawQuery<
    {
      name: string
      value: number
    }[]
  >(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_content')}
    `,
    queryParams
  )

  const termRes = await rawQuery<
    {
      name: string
      value: number
    }[]
  >(
    `
    ${currency ? revenueEventQuery : eventQuery}
    ${getModelQuery(model)}
    ${getUTMQuery('utm_term')}
    `,
    queryParams
  )

  const totalRes = await rawQuery<{
    pageviews: number
    visitors: number
    visits: number
  }>(
    `
    SELECT 
        COUNT(*) as "pageviews",
        uniqExact(session_id) as "visitors",
        uniqExact(visit_id) as "visits"
    FROM website_event
    ${cohortQuery}
    WHERE website_id = {websiteId:UUID}
        AND created_at between {startDate:DateTime64} AND {endDate:DateTime64}
        AND ${column} = {step:String}
        ${filterQuery}
    `,
    queryParams
  ).then((result) => result?.[0])

  return {
    referrer: referrerRes,
    paidAds: paidAdsres,
    utm_source: sourceRes,
    utm_medium: mediumRes,
    utm_campaign: campaignRes,
    utm_content: contentRes,
    utm_term: termRes,
    total: totalRes,
  }
}
