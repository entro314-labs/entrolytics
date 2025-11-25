import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  error?: string;
}

interface HealthResponse {
  timestamp: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
}

/**
 * GET /api/health/integrations
 *
 * Comprehensive health check for all ecosystem integrations:
 * - Database connectivity
 * - CLI token system
 * - SDK event endpoint
 * - Redis (if configured)
 */
export async function GET() {
  const checks: HealthCheck[] = [];
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // Check 1: Database
  const dbCheck = await checkDatabase();
  checks.push(dbCheck);
  if (dbCheck.status !== 'healthy') overallStatus = 'degraded';

  // Check 2: CLI Token System
  const cliCheck = await checkCliTokenSystem();
  checks.push(cliCheck);
  if (cliCheck.status !== 'healthy') overallStatus = 'degraded';

  // Check 3: SDK Event Endpoint
  const sdkCheck = await checkSdkEndpoint();
  checks.push(sdkCheck);
  if (sdkCheck.status !== 'healthy') overallStatus = 'degraded';

  // Check 4: Redis (optional)
  if (process.env.REDIS_URL) {
    const redisCheck = await checkRedis();
    checks.push(redisCheck);
    if (redisCheck.status !== 'healthy') overallStatus = 'degraded';
  }

  const response: HealthResponse = {
    timestamp: new Date().toISOString(),
    status: overallStatus,
    checks,
  };

  const statusCode = overallStatus === 'healthy' ? 200 : 503;

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Check database connectivity and basic operations
 */
async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    // Simple query to test connectivity
    await db.execute(sql`SELECT 1 as health_check`);
    const latency = Date.now() - start;

    return {
      service: 'database',
      status: latency < 100 ? 'healthy' : 'degraded',
      latency,
    };
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check CLI token table exists and is accessible
 */
async function checkCliTokenSystem(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    // Check if CLI token table exists and can be queried
    const result = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM cli_setup_token
      WHERE status = 'pending'
        AND expires_at > NOW()
    `);

    const latency = Date.now() - start;

    return {
      service: 'cli_tokens',
      status: latency < 100 ? 'healthy' : 'degraded',
      latency,
    };
  } catch (error) {
    return {
      service: 'cli_tokens',
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'CLI token table not accessible',
    };
  }
}

/**
 * Check SDK event ingestion endpoint
 */
async function checkSdkEndpoint(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const healthUrl = `${apiHost}/api/health`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(healthUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Entrolytics-Health-Check',
      },
    });

    clearTimeout(timeout);
    const latency = Date.now() - start;

    return {
      service: 'sdk_endpoint',
      status: response.ok ? (latency < 200 ? 'healthy' : 'degraded') : 'unhealthy',
      latency,
      error: !response.ok ? `HTTP ${response.status}` : undefined,
    };
  } catch (error) {
    return {
      service: 'sdk_endpoint',
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'SDK endpoint unreachable',
    };
  }
}

/**
 * Check Redis connectivity (if configured)
 */
async function checkRedis(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    // Dynamically import Redis client to avoid errors if not configured
    const { redis } = await import('@/lib/redis');

    await redis.ping();
    const latency = Date.now() - start;

    return {
      service: 'redis',
      status: latency < 50 ? 'healthy' : 'degraded',
      latency,
    };
  } catch (error) {
    return {
      service: 'redis',
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Redis unavailable',
    };
  }
}
