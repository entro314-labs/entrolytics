export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { notFound } from '@/lib/response'
import redis from '@/lib/redis'
import { findLinkBySlug } from '@/queries/drizzle'
import { POST } from '@/app/api/send/route'
import type { Link } from '@/lib/db/schema'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let link: Link | null

  if (redis.enabled) {
    link = await redis.client.fetch(
      `link:${slug}`,
      async () => {
        return findLinkBySlug(slug)
      },
      86400,
    )

    if (!link) {
      return notFound()
    }
  } else {
    link = await findLinkBySlug(slug)

    if (!link) {
      return notFound()
    }
  }

  const payload = {
    type: 'event',
    payload: {
      link: link.linkId,
      url: request.url,
      referrer: request.headers.get('referer'),
    },
  }

  const req = new Request(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify(payload),
  })

  await POST(req)

  return NextResponse.redirect(link.url)
}
