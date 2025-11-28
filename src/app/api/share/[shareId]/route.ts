import { NextResponse } from 'next/server';
import { secret } from '@/lib/crypto';
import { createToken } from '@/lib/jwt';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { json, notFound } from '@/lib/response';
import { getSharedWebsite } from '@/queries/drizzle';

export async function GET(request: Request, { params }: { params: Promise<{ shareId: string }> }) {
  // Rate limit: 10 requests per minute
  const rateLimitResult = await rateLimit(RATE_LIMITS.SHARE_TOKEN_GENERATION);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        retryAfter: rateLimitResult.reset - Math.floor(Date.now() / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        },
      },
    );
  }

  const { shareId } = await params;

  const website = await getSharedWebsite(shareId);

  if (!website) {
    return notFound();
  }

  // SECURITY: Include shareId and expiry in token to enable revocation
  // Token expires in 24 hours
  const exp = Math.floor(Date.now() / 1000) + 86400;
  const data = {
    websiteId: website.websiteId,
    shareId,
    exp,
    type: 'share_token',
  };
  const token = createToken(data, secret());

  return json({ websiteId: website.websiteId, token });
}
