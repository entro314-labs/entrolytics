import { buildUrl } from '@/lib/url'
import { shouldProxy, proxyRequest } from '@/lib/proxy'

export interface ErrorResponse {
  error: {
    status: number
    message: string
    code?: string
  }
}

export interface FetchResponse {
  ok: boolean
  status: number
  data?: any
  error?: ErrorResponse
}

export async function request(
  method: string,
  url: string,
  body?: string,
  headers: object = {}
): Promise<FetchResponse> {
  // Check if this is an external URL that needs proxying
  if (typeof window !== 'undefined' && shouldProxy(url)) {
    try {
      console.log(`[PROXY] Routing external request through proxy: ${method} ${url}`)
      console.trace('[PROXY] Request stack trace:')
      const proxyResponse = await proxyRequest({
        url,
        method: method as any,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...headers,
        } as Record<string, string>,
        body: body ? JSON.parse(body) : undefined,
      })

      return {
        ok: proxyResponse.status >= 200 && proxyResponse.status < 300,
        status: proxyResponse.status,
        data:
          proxyResponse.status >= 200 && proxyResponse.status < 300
            ? proxyResponse.data
            : undefined,
        error:
          proxyResponse.status >= 200 && proxyResponse.status < 300
            ? undefined
            : proxyResponse.data,
      }
    } catch (error) {
      console.error('[PROXY] Proxy request failed:', error)
      return {
        ok: false,
        status: 500,
        error: {
          error: {
            status: 500,
            message: `Proxy request failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        },
      }
    }
  }

  // Use regular fetch for internal URLs
  return fetch(url, {
    method,
    cache: 'no-cache',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  }).then(async (res) => {
    const data = await res.json()

    return {
      ok: res.ok,
      status: res.status,
      data: res.ok ? data : undefined,
      error: res.ok ? undefined : data,
    }
  })
}

export async function httpGet(path: string, params: object = {}, headers: object = {}) {
  return request('GET', buildUrl(path, params), undefined, headers)
}

export async function httpDelete(path: string, params: object = {}, headers: object = {}) {
  return request('DELETE', buildUrl(path, params), undefined, headers)
}

export async function httpPost(path: string, params: object = {}, headers: object = {}) {
  return request('POST', path, JSON.stringify(params), headers)
}

export async function httpPut(path: string, params: object = {}, headers: object = {}) {
  return request('PUT', path, JSON.stringify(params), headers)
}
