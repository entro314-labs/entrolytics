import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { CliTokenService } from '@/lib/cli-tokens';
import { db } from '@/lib/db';
import { website } from '@/lib/db/schema';

/**
 * POST /api/cli/validate
 * Validate and consume a CLI token
 *
 * This endpoint does NOT require authentication
 * The token itself provides the authorization
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Extract client info for audit
    const ipAddress =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Validate token
    const result = await CliTokenService.validateToken(token, ipAddress, userAgent);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    // Get website details
    const [websiteData] = await db
      .select()
      .from(website)
      .where(eq(website.websiteId, result.token!.websiteId))
      .limit(1);

    if (!websiteData) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      website: {
        id: websiteData.websiteId,
        name: websiteData.name,
        domain: websiteData.domain,
        shareId: websiteData.shareId,
      },
      apiHost: process.env.NEXT_PUBLIC_API_URL || 'https://edge.entrolytics.click',
    });
  } catch (error) {
    console.error('Error validating CLI token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
