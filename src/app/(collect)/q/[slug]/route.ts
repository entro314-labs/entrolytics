export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { POST } from '@/app/api/send/route';
import type { Link } from '@/lib/db/schema';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import redis from '@/lib/redis';
import { notFound } from '@/lib/response';
import { findLinkBySlug } from '@/queries/drizzle';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  // Rate limit: 100 redirects per minute per IP
  const rateLimitResult = await rateLimit(RATE_LIMITS.LINK_REDIRECT);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
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

  const { slug } = await params;

  let link: Link | null;

  if (redis.enabled) {
    link = await redis.client.fetch(
      `link:${slug}`,
      async () => {
        return findLinkBySlug(slug);
      },
      86400,
    );

    if (!link) {
      return notFound();
    }
  } else {
    link = await findLinkBySlug(slug);

    if (!link) {
      return notFound();
    }
  }

  const payload = {
    type: 'event',
    payload: {
      link: link.linkId,
      url: request.url,
      referrer: request.headers.get('referer'),
    },
  };

  const req = new Request(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify(payload),
  });

  await POST(req);

  // SECURITY: Validate URL protocol before redirecting to prevent open redirect/XSS
  try {
    const targetUrl = new URL(link.url);
    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      return notFound();
    }
    return NextResponse.redirect(targetUrl);
  } catch {
    // Invalid URL - should never happen due to schema validation, but defense in depth
    return notFound();
  }
}
