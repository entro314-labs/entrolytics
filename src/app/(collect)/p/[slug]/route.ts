export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { POST } from '@/app/api/send/route';
import type { Pixel } from '@/lib/db/schema';
import redis from '@/lib/redis';
import { notFound } from '@/lib/response';
import { findPixelBySlug } from '@/queries/drizzle';

const image = Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw', 'base64');

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let pixel: Pixel | null;

  if (redis.enabled) {
    pixel = await redis.client.fetch(
      `pixel:${slug}`,
      async () => {
        return findPixelBySlug(slug);
      },
      86400,
    );

    if (!pixel) {
      return notFound();
    }
  } else {
    pixel = await findPixelBySlug(slug);

    if (!pixel) {
      return notFound();
    }
  }

  const payload = {
    type: 'event',
    payload: {
      pixel: pixel.pixelId,
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

  return new NextResponse(image, {
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': image.length.toString(),
    },
  });
}
