/**
 * Proxy utility for making external requests through our internal API
 * This bypasses CSP restrictions by routing external requests through our server
 */

interface ProxyRequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
}

interface ProxyResponse<T = any> {
  status: number
  statusText: string
  headers: Record<string, string>
  data: T
}

/**
 * Make a proxied request to an external URL
 */
export async function proxyRequest<T = any>(options: ProxyRequestOptions): Promise<ProxyResponse<T>> {
  const { url, method = 'GET', headers, body } = options

  const response = await fetch('/api/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      method,
      headers,
      body,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`Proxy request failed: ${errorData.error || errorData.message || response.statusText}`)
  }

  return response.json()
}

/**
 * Simplified GET request through proxy
 */
export async function proxyGet<T = any>(url: string, headers?: Record<string, string>): Promise<T> {
  const response = await proxyRequest<T>({ url, method: 'GET', headers })
  return response.data
}

/**
 * Simplified POST request through proxy
 */
export async function proxyPost<T = any>(
  url: string,
  body: any,
  headers?: Record<string, string>
): Promise<T> {
  const response = await proxyRequest<T>({ url, method: 'POST', body, headers })
  return response.data
}

/**
 * GET request using query parameter approach (alternative)
 */
export async function proxyGetSimple<T = any>(url: string): Promise<ProxyResponse<T>> {
  const encodedUrl = encodeURIComponent(url)
  const response = await fetch(`/api/proxy?url=${encodedUrl}`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`Proxy request failed: ${errorData.error || errorData.message || response.statusText}`)
  }

  return response.json()
}

/**
 * Check if a URL should be proxied (external domain)
 */
export function shouldProxy(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const currentHost = window.location.hostname

    // If it's the same domain, no need to proxy
    if (urlObj.hostname === currentHost) {
      return false
    }

    // If it's a relative URL, no need to proxy
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return false
    }

    // If it's an external URL, proxy it
    return true
  } catch {
    // If URL parsing fails, assume it's relative and don't proxy
    return false
  }
}

/**
 * Smart fetch that automatically uses proxy for external URLs
 */
export async function smartFetch(url: string, options?: RequestInit): Promise<Response> {
  if (shouldProxy(url)) {
    // Use proxy for external URLs
    const proxyResponse = await proxyRequest({
      url,
      method: (options?.method as any) || 'GET',
      headers: options?.headers as Record<string, string>,
      body: options?.body,
    })

    // Create a Response-like object
    return new Response(JSON.stringify(proxyResponse.data), {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: new Headers(proxyResponse.headers),
    })
  } else {
    // Use regular fetch for internal URLs
    return fetch(url, options)
  }
}