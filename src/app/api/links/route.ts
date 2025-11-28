import { NextResponse } from 'next/server';
import { z } from 'zod';
import { uuid } from '@/lib/crypto';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams } from '@/lib/schema';
import { createLink, getUserLinks } from '@/queries/drizzle';
import { canCreateOrgWebsite, canCreateWebsite } from '@/validations';

export async function GET(request: Request) {
  // Check if we're in a build context
  if (!request || typeof request !== 'object' || !('url' in request)) {
    return new Response('Build time', { status: 200 });
  }

  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  });

  const { auth, query, error } = (await parseRequest(request, schema)) || {};

  if (error) {
    return error();
  }

  const filters = await getQueryFilters(query);

  const links = await getUserLinks(auth?.user.userId, filters);

  return json(links);
}

export async function POST(request: Request) {
  // Check if we're in a build context
  if (!request || typeof request !== 'object' || !('url' in request)) {
    return new Response('Build time', { status: 200 });
  }

  // Rate limit: 20 link creations per minute
  const rateLimitResult = await rateLimit(RATE_LIMITS.LINK_CREATION);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many link creations. Please try again later.',
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

  const schema = z.object({
    name: z.string().max(100),
    url: z
      .string()
      .max(500)
      .url('Must be a valid URL')
      .refine(
        urlString => {
          try {
            const url = new URL(urlString);
            return ['http:', 'https:'].includes(url.protocol);
          } catch {
            return false;
          }
        },
        { message: 'URL must use http or https protocol' },
      ),
    slug: z.string().max(100),
    orgId: z.string().nullable().optional(),
    id: z.string().uuid().nullable().optional(),
  });

  const { auth, body, error } = (await parseRequest(request, schema)) || {};

  if (error) {
    return error();
  }

  const { id, name, url, slug, orgId } = body || {};

  if ((orgId && !(await canCreateOrgWebsite(auth, orgId))) || !(await canCreateWebsite(auth))) {
    return unauthorized();
  }

  const data: any = {
    id: id ?? uuid(),
    name,
    url,
    slug,
    org_id: orgId,
  };

  if (!orgId) {
    data.user_id = auth?.user.userId;
  }

  const result = await createLink(data);

  return json(result);
}
