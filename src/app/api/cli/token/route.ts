import { currentUser } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CliTokenService } from '@/lib/cli-tokens';
import { db } from '@/lib/db';
import { website } from '@/lib/db/schema';
import { getUserByClerkId } from '@/queries/drizzle';

const createTokenSchema = z.object({
  websiteId: z.string().uuid(),
  orgId: z.string().optional(),
  expiresInMinutes: z.number().min(5).max(60).optional(),
});

/**
 * POST /api/cli/token
 * Create a new CLI setup token
 *
 * Requires authentication via Clerk
 * Rate limited to 10 tokens per hour per user
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const clerkUser = await currentUser();
    if (!clerkUser) {
      console.error('[CLI Token] No authenticated Clerk user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CLI Token] Clerk user authenticated:', clerkUser.id);

    // Get database user from Clerk ID
    const dbUser = await getUserByClerkId(clerkUser.id);
    if (!dbUser) {
      console.error('[CLI Token] User not found in database for Clerk ID:', clerkUser.id);
      return NextResponse.json(
        { error: 'User not found in database. Please try again in a moment.' },
        { status: 404 },
      );
    }

    console.log('[CLI Token] Database user found:', dbUser.userId);

    const body = await request.json();
    console.log('[CLI Token] Request body:', body);

    const validation = createTokenSchema.safeParse(body);

    if (!validation.success) {
      console.error('[CLI Token] Validation failed:', validation.error.issues);
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 },
      );
    }

    const { websiteId, orgId, expiresInMinutes } = validation.data;

    console.log('[CLI Token] Checking website access for:', { websiteId, userId: dbUser.userId });

    // Verify user has access to this website
    const [websiteRecord] = await db
      .select()
      .from(website)
      .where(and(eq(website.websiteId, websiteId), eq(website.userId, dbUser.userId)))
      .limit(1);

    if (!websiteRecord) {
      console.error('[CLI Token] Website not found or access denied:', {
        websiteId,
        userId: dbUser.userId,
      });
      return NextResponse.json({ error: 'Website not found or access denied' }, { status: 404 });
    }

    console.log('[CLI Token] Creating token for website:', websiteId);

    // Create token
    const token = await CliTokenService.createToken({
      userId: dbUser.userId, // Use database UUID, not Clerk ID
      websiteId,
      orgId,
      expiresInMinutes,
    });

    console.log('[CLI Token] Token created successfully:', token.token.substring(0, 10) + '...');

    return NextResponse.json({
      token: token.token,
      expiresAt: token.expiresAt,
      websiteId: token.websiteId,
    });
  } catch (error) {
    console.error('[CLI Token] Error creating CLI token:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/cli/token
 * Get active tokens for the current user
 */
export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get database user from Clerk ID
    const dbUser = await getUserByClerkId(clerkUser.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const tokens = await CliTokenService.getUserTokens(dbUser.userId);

    return NextResponse.json({
      tokens: tokens.map(token => ({
        id: token.tokenId,
        websiteId: token.websiteId,
        purpose: token.purpose,
        createdAt: token.createdAt,
        expiresAt: token.expiresAt,
        status: token.status,
      })),
    });
  } catch (error) {
    console.error('Error getting CLI tokens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
