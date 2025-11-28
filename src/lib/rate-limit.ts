import { headers } from 'next/headers';
import redis from '@/lib/redis';

export interface RateLimitConfig {
  /**
   * Unique identifier for this rate limit bucket
   */
  bucket: string;

  /**
   * Maximum number of requests allowed
   */
  limit: number;

  /**
   * Time window in seconds
   */
  window: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Get client identifier from request headers
 * Uses IP address or a combination of headers for identification
 */
async function getClientId(): Promise<string> {
  const headersList = await headers();

  // Try to get real IP from various headers
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const cfConnectingIp = headersList.get('cf-connecting-ip');

  const ip =
    cfConnectingIp || realIp || forwardedFor?.split(',')[0]?.trim() || 'unknown';

  return ip;
}

/**
 * Check rate limit for a given client and bucket
 *
 * Uses Redis if available (distributed rate limiting), falls back to
 * in-memory Map (single instance) if Redis is not enabled.
 *
 * Algorithm: Sliding window counter
 */
export async function rateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const clientId = await getClientId();
  const key = `ratelimit:${config.bucket}:${clientId}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - config.window;

  if (redis.enabled) {
    // Use Redis for distributed rate limiting
    const multi = redis.client.multi();

    // Remove old entries outside the window
    multi.zremrangebyscore(key, 0, windowStart);

    // Count current requests in window
    multi.zcard(key);

    // Add current request
    multi.zadd(key, now, `${now}:${Math.random()}`);

    // Set expiry on the key
    multi.expire(key, config.window);

    const results = await multi.exec();

    // Results: [removeResult, countResult, addResult, expireResult]
    const count = (results?.[1] as number) || 0;

    const remaining = Math.max(0, config.limit - count - 1);
    const reset = now + config.window;

    if (count >= config.limit) {
      return {
        success: false,
        limit: config.limit,
        remaining: 0,
        reset,
      };
    }

    return {
      success: true,
      limit: config.limit,
      remaining,
      reset,
    };
  }

  // Fallback to in-memory rate limiting (single instance only)
  return inMemoryRateLimit(key, config, now, windowStart);
}

/**
 * In-memory rate limiting store (fallback when Redis is not available)
 * Note: This only works for single instance deployments
 */
const rateLimitStore = new Map<string, number[]>();

function inMemoryRateLimit(
  key: string,
  config: RateLimitConfig,
  now: number,
  windowStart: number,
): RateLimitResult {
  // Get or create bucket
  let timestamps = rateLimitStore.get(key) || [];

  // Remove old entries
  timestamps = timestamps.filter(ts => ts > windowStart);

  // Check limit
  if (timestamps.length >= config.limit) {
    rateLimitStore.set(key, timestamps);

    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: now + config.window,
    };
  }

  // Add current request
  timestamps.push(now);
  rateLimitStore.set(key, timestamps);

  // Clean up old keys periodically (basic memory management)
  if (Math.random() < 0.01) {
    // 1% chance
    cleanupRateLimitStore(windowStart);
  }

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - timestamps.length,
    reset: now + config.window,
  };
}

/**
 * Clean up old entries from in-memory store
 */
function cleanupRateLimitStore(threshold: number) {
  for (const [key, timestamps] of rateLimitStore.entries()) {
    const filtered = timestamps.filter(ts => ts > threshold);
    if (filtered.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, filtered);
    }
  }
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  // Strict limits for security-sensitive endpoints
  CLI_TOKEN_EXCHANGE: {
    bucket: 'cli:token',
    limit: 5,
    window: 60, // 5 requests per minute
  },

  SHARE_TOKEN_GENERATION: {
    bucket: 'share:token',
    limit: 10,
    window: 60, // 10 requests per minute
  },

  LINK_CREATION: {
    bucket: 'link:create',
    limit: 20,
    window: 60, // 20 links per minute
  },

  // Medium limits for tracking/redirect
  LINK_REDIRECT: {
    bucket: 'link:redirect',
    limit: 100,
    window: 60, // 100 redirects per minute per IP
  },

  // General API limits
  API_GENERAL: {
    bucket: 'api:general',
    limit: 100,
    window: 60, // 100 requests per minute
  },
} as const;
