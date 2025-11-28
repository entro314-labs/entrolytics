import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { secret } from '@/lib/crypto';
import { createToken } from '@/lib/jwt';
import { getUserByClerkId } from '@/queries/drizzle';

const authorizeSchema = z.object({
  port: z.string().regex(/^\d+$/),
});

/**
 * POST /api/cli/authorize
 * Generate a temporary authorization code for CLI login
 *
 * This endpoint requires authentication via Clerk
 * Returns a short-lived code that can be exchanged for tokens
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get database user
    const dbUser = await getUserByClerkId(clerkUser.id);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found. Please complete your account setup first.' },
        { status: 404 },
      );
    }

    // Validate request
    const body = await request.json();
    const validation = authorizeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Generate authorization code (short-lived token)
    const code = createToken(
      {
        type: 'cli_auth_code',
        userId: dbUser.userId,
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        port: validation.data.port,
        exp: Math.floor(Date.now() / 1000) + 300, // 5 minute expiry
      },
      secret(),
    );

    return NextResponse.json({ code });
  } catch (error) {
    console.error('Error generating CLI auth code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
