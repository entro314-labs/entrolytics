/**
 * Edge-compatible detection functions
 *
 * This module provides the same functionality as detect.ts but without
 * Node.js dependencies (no maxmind file I/O, no Buffer).
 *
 * Key differences:
 * - Uses provider headers only for geolocation (Cloudflare, Vercel, etc.)
 * - No MaxMind database lookup (requires file I/O)
 * - Uses TextDecoder instead of Buffer for header decoding
 */

import { browserName, detectOS } from 'detect-browser';
import { UAParser } from 'ua-parser-js';
import { safeDecodeURIComponent } from '@/lib/url';

// The order here is important and influences how IPs are detected
export const IP_ADDRESS_HEADERS = [
  'x-client-ip',
  'x-forwarded-for',
  'cf-connecting-ip',
  'do-connecting-ip',
  'fastly-client-ip',
  'true-client-ip',
  'x-real-ip',
  'x-cluster-client-ip',
  'x-forwarded',
  'forwarded',
  'x-appengine-user-ip',
  'x-nf-client-connection-ip',
];

const PROVIDER_HEADERS = [
  // Cloudflare headers
  {
    countryHeader: 'cf-ipcountry',
    regionHeader: 'cf-region-code',
    cityHeader: 'cf-ipcity',
  },
  // Vercel headers
  {
    countryHeader: 'x-vercel-ip-country',
    regionHeader: 'x-vercel-ip-country-region',
    cityHeader: 'x-vercel-ip-city',
  },
  // CloudFront headers
  {
    countryHeader: 'cloudfront-viewer-country',
    regionHeader: 'cloudfront-viewer-country-region',
    cityHeader: 'cloudfront-viewer-city',
  },
  // Netlify headers
  {
    countryHeader: 'x-country',
    regionHeader: 'x-country-region',
    cityHeader: 'x-city',
  },
];

export function getIpAddress(headers: Headers): string | null {
  const customHeader = process.env.CLIENT_IP_HEADER;

  if (customHeader && headers.get(customHeader)) {
    return headers.get(customHeader);
  }

  const header = IP_ADDRESS_HEADERS.find(name => headers.get(name));
  const ip = header ? headers.get(header) : null;

  if (header === 'x-forwarded-for' && ip) {
    return ip.split(',')[0]?.trim() || null;
  }

  if (header === 'forwarded' && ip) {
    const match = ip.match(/for=(\[?[0-9a-fA-F:.]+\]?)/);
    if (match) {
      return match[1];
    }
  }

  return ip;
}

export function getDevice(userAgent: string): string {
  const { device } = UAParser(userAgent);
  return device?.type || 'desktop';
}

function getRegionCode(country: string, region: string): string | undefined {
  if (!country || !region) {
    return undefined;
  }
  return region.includes('-') ? region : `${country}-${region}`;
}

/**
 * Decode header value using TextDecoder (edge-compatible)
 * Replaces Buffer.from(s, 'latin1').toString('utf-8')
 */
function decodeHeader(s: string | undefined | null): string | undefined | null {
  if (s === undefined || s === null) {
    return s;
  }

  // Convert latin1 encoded string to UTF-8
  const bytes = new Uint8Array([...s].map(c => c.charCodeAt(0)));
  return new TextDecoder('utf-8').decode(bytes);
}

/**
 * Check if IP is localhost (simplified for edge)
 */
function isLocalhostIp(ip: string): boolean {
  if (!ip) return true;

  const localhostPatterns = [
    '127.0.0.1',
    '::1',
    'localhost',
    '0.0.0.0',
    '127.0.0.0',
    '::ffff:127.0.0.1',
  ];

  return localhostPatterns.some(
    pattern => ip === pattern || ip.startsWith('127.') || ip.startsWith('::ffff:127.'),
  );
}

/**
 * Get location from provider headers (no MaxMind lookup on edge)
 */
export async function getLocation(
  ip: string = '',
  headers: Headers,
  hasPayloadIP: boolean,
): Promise<{ country?: string; region?: string; city?: string } | null> {
  // Ignore local IPs
  if (!ip || isLocalhostIp(ip)) {
    return null;
  }

  // On edge, we only use provider headers (no MaxMind)
  if (!hasPayloadIP && !process.env.SKIP_LOCATION_HEADERS) {
    for (const provider of PROVIDER_HEADERS) {
      const countryHeader = headers.get(provider.countryHeader);
      if (countryHeader) {
        const country = decodeHeader(countryHeader) || undefined;
        const region = decodeHeader(headers.get(provider.regionHeader)) || undefined;
        const city = decodeHeader(headers.get(provider.cityHeader)) || undefined;

        return {
          country,
          region: getRegionCode(country || '', region || ''),
          city,
        };
      }
    }
  }

  // No fallback to MaxMind on edge - return null
  return null;
}

/**
 * Get client information from request
 */
export async function getClientInfo(
  request: Request,
  payload: Record<string, unknown>,
): Promise<{
  userAgent: string;
  browser: string | null;
  os: string | null;
  ip: string | null;
  country: string | undefined;
  region: string | undefined;
  city: string | undefined;
  device: string;
}> {
  const userAgent = (payload?.userAgent as string) || request.headers.get('user-agent') || '';
  const ip = (payload?.ip as string) || getIpAddress(request.headers);
  const location = await getLocation(ip || '', request.headers, !!payload?.ip);
  const country = safeDecodeURIComponent(location?.country);
  const region = safeDecodeURIComponent(location?.region);
  const city = safeDecodeURIComponent(location?.city);
  const browser = browserName(userAgent);
  const os = detectOS(userAgent) as string | null;
  const device = getDevice(userAgent);

  return { userAgent, browser, os, ip, country, region, city, device };
}

/**
 * Check if IP is blocked (simplified for edge - no CIDR support)
 */
export function hasBlockedIp(clientIp: string): boolean {
  const ignoreIps = process.env.IGNORE_IP;

  if (!ignoreIps || !clientIp) {
    return false;
  }

  const ips = ignoreIps.split(',').map(n => n.trim());

  // Simple exact match only on edge (no CIDR support without ipaddr.js)
  return ips.includes(clientIp);
}
