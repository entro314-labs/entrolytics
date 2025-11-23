/**
 * Native Edge Runtime Send Route
 *
 * This route runs NATIVELY on Edge Runtime without proxying to Node.js.
 * Uses Web Crypto API, jose for JWT, and provider headers for geolocation.
 *
 * Phase 2 implementation - true edge-native analytics collection.
 *
 * Limitations vs Node.js version:
 * - No MaxMind database lookup (uses provider geo headers only)
 * - No CIDR IP blocking (exact match only)
 * - Requires Neon serverless database connection
 *
 * Enable with: ENABLE_NATIVE_EDGE=true
 */

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const preferredRegion = 'auto'

import { z } from 'zod'
import { isbot } from 'isbot'
import { startOfHour, startOfMonth } from 'date-fns'
import { hash, secret, uuid } from '@/lib/crypto-edge'
import { createToken, parseToken } from '@/lib/jwt-edge'
import { getClientInfo, hasBlockedIp } from '@/lib/detect-edge'
import { COLLECTION_TYPE, EVENT_TYPE } from '@/lib/constants'
import { safeDecodeURI, safeDecodeURIComponent } from '@/lib/url'

// Note: Database queries would need edge-compatible versions
// For now, this demonstrates the pattern - full implementation requires
// migrating query functions to use Neon HTTP driver on edge

interface Cache {
  websiteId: string
  sessionId: string
  visitId: string
  iat: number
}

const anyObjectParam = z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]))
const urlOrPathParam = z.string().max(500)

const schema = z.object({
  type: z.enum(['event', 'identify']),
  payload: z
    .object({
      website: z.string().uuid().optional(),
      link: z.string().uuid().optional(),
      pixel: z.string().uuid().optional(),
      data: anyObjectParam.optional(),
      hostname: z.string().max(100).optional(),
      language: z.string().max(35).optional(),
      referrer: urlOrPathParam.optional(),
      screen: z.string().max(11).optional(),
      title: z.string().optional(),
      url: urlOrPathParam.optional(),
      name: z.string().max(50).optional(),
      tag: z.string().max(50).optional(),
      ip: z.union([z.ipv4(), z.ipv6()]).optional(),
      userAgent: z.string().optional(),
      timestamp: z.coerce.number().int().optional(),
      id: z.string().optional(),
    })
    .refine(
      (data) => {
        const keys = [data.website, data.link, data.pixel]
        const count = keys.filter(Boolean).length
        return count === 1
      },
      {
        message: 'Exactly one of website, link, or pixel must be provided',
        path: ['website'],
      }
    ),
})

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-Entrolytics-Edge': 'native',
    },
  })
}

function badRequest(message: string): Response {
  return json({ error: message }, 400)
}

function forbidden(): Response {
  return json({ error: 'Forbidden' }, 403)
}

export async function POST(request: Request): Promise<Response> {
  try {
    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return badRequest('Invalid JSON body')
    }

    // Validate schema
    const result = schema.safeParse(body)
    if (!result.success) {
      return badRequest(result.error.message)
    }

    const { type, payload } = result.data
    const {
      website: websiteId,
      pixel: pixelId,
      link: linkId,
      hostname,
      screen,
      language,
      url,
      referrer,
      name,
      data,
      title,
      tag,
      timestamp,
      id,
    } = payload

    // Cache check (session continuity)
    let cache: Cache | null = null
    const cacheHeader = request.headers.get('x-entrolytics-cache')
    const secretValue = await secret()

    if (cacheHeader && websiteId) {
      const parsed = await parseToken(cacheHeader, secretValue)
      if (parsed && typeof parsed === 'object') {
        cache = parsed as Cache
      }
    }

    // Get client info (edge-compatible)
    const clientInfo = await getClientInfo(request, payload)
    const { ip, userAgent, device, browser, os, country, region, city } = clientInfo

    // Bot check
    if (!process.env.DISABLE_BOT_CHECK && isbot(userAgent)) {
      return json({ beep: 'boop' })
    }

    // IP block check
    if (hasBlockedIp(ip || '')) {
      return forbidden()
    }

    const sourceId = websiteId || pixelId || linkId
    const createdAt = timestamp ? new Date(timestamp * 1000) : new Date()
    const now = Math.floor(Date.now() / 1000)

    // Generate session/visit IDs using edge-compatible crypto
    const sessionSalt = await hash(startOfMonth(createdAt).toUTCString())
    const visitSalt = await hash(startOfHour(createdAt).toUTCString())

    const sessionId = id
      ? await uuid(sourceId!, id)
      : await uuid(sourceId!, ip || '', userAgent, sessionSalt)

    // Visit info
    let visitId = cache?.visitId || (await uuid(sessionId, visitSalt))
    let iat = cache?.iat || now

    // Expire visit after 30 minutes
    if (!timestamp && now - iat > 1800) {
      visitId = await uuid(sessionId, visitSalt)
      iat = now
    }

    // Prepare event data
    const eventData = {
      type,
      sourceId,
      sessionId,
      visitId,
      createdAt: createdAt.toISOString(),
      // Client info
      ip,
      userAgent,
      browser,
      os,
      device,
      country,
      region,
      city,
      // Page info
      hostname,
      url,
      referrer,
      title,
      screen,
      language,
      // Event info
      name,
      data,
      tag,
      distinctId: id,
      eventType:
        linkId
          ? EVENT_TYPE.linkEvent
          : pixelId
            ? EVENT_TYPE.pixelEvent
            : name
              ? EVENT_TYPE.customEvent
              : EVENT_TYPE.pageView,
    }

    // TODO: Implement edge-compatible database write
    // This would use Neon serverless HTTP driver
    // For now, log the event data (in production, send to queue/database)
    console.log('[Edge Native] Event:', JSON.stringify(eventData))

    // Generate cache token for session continuity
    const token = await createToken({ websiteId, sessionId, visitId, iat }, secretValue)

    return json({ cache: token, sessionId, visitId })
  } catch (error) {
    console.error('[Edge Native] Error:', error)
    return json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Entrolytics-Cache',
      'Access-Control-Max-Age': '86400',
    },
  })
}
