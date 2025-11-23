/**
 * Edge Proxy Route for /api/send
 *
 * This route runs on Vercel Edge Runtime and forwards requests to the main
 * Node.js backend. This provides ~50% latency improvement by routing requests
 * through global edge nodes before hitting the backend.
 *
 * Phase 1 of Edge Runtime implementation (proxy pattern).
 * Phase 2 will implement native edge-compatible crypto/jwt for full edge-native support.
 */

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const preferredRegion = 'auto'

const INGEST_URL = process.env.ENTROLYTICS_INGEST_URL || process.env.EDGE_URL

export async function POST(request: Request) {
  const targetUrl = INGEST_URL
    ? `${INGEST_URL.replace(/\/$/, '')}/api/send`
    : new URL('/api/send', request.url).toString().replace('/send-edge', '/send')

  try {
    // Clone request body for forwarding
    const body = await request.text()

    // Forward request preserving critical headers
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Preserve user identification headers
        'User-Agent': request.headers.get('user-agent') || '',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
        'X-Real-IP': request.headers.get('x-real-ip') || '',
        // Cloudflare headers
        'CF-Connecting-IP': request.headers.get('cf-connecting-ip') || '',
        'CF-IPCountry': request.headers.get('cf-ipcountry') || '',
        'CF-Ray': request.headers.get('cf-ray') || '',
        // Vercel headers
        'X-Vercel-IP-Country': request.headers.get('x-vercel-ip-country') || '',
        'X-Vercel-IP-City': request.headers.get('x-vercel-ip-city') || '',
        'X-Vercel-IP-Region': request.headers.get('x-vercel-ip-region') || '',
        'X-Vercel-IP-Latitude': request.headers.get('x-vercel-ip-latitude') || '',
        'X-Vercel-IP-Longitude': request.headers.get('x-vercel-ip-longitude') || '',
        // Netlify headers
        'X-Nf-Client-Connection-IP': request.headers.get('x-nf-client-connection-ip') || '',
        'X-Country': request.headers.get('x-country') || '',
        // Cache header (session continuity)
        'X-Entrolytics-Cache': request.headers.get('x-entrolytics-cache') || '',
        // Origin headers for CORS
        Origin: request.headers.get('origin') || '',
        Referer: request.headers.get('referer') || '',
      },
      body,
    })

    // Return response with CORS headers
    const responseBody = await response.text()

    return new Response(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Entrolytics-Cache',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        // Indicate this came through edge proxy for debugging
        'X-Entrolytics-Edge': 'proxy',
      },
    })
  } catch (error) {
    console.error('[Edge Proxy] Error forwarding request:', error)

    return new Response(
      JSON.stringify({
        error: 'Edge proxy error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Entrolytics-Edge': 'proxy-error',
        },
      }
    )
  }
}

export async function OPTIONS() {
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
