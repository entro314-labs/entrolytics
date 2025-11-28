import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { secret } from '@/lib/crypto';
import { createToken, parseToken } from '@/lib/jwt';
import { getUser } from '@/queries/drizzle';

const tokenSchema = z.object({
  code: z.string(),
});

interface AuthCodePayload {
  type: string;
  userId: string;
  clerkId: string;
  email: string;
  port: string;
  exp: number;
}

/**
 * POST /api/auth/cli/token
 * Exchange authorization code for access tokens
 *
 * This is the token exchange endpoint for CLI OAuth flow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = tokenSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Verify authorization code
    const payload = parseToken(validation.data.code, secret()) as AuthCodePayload | null;

    if (!payload || payload.type !== 'cli_auth_code') {
      return NextResponse.json({ error: 'Invalid or expired authorization code' }, { status: 401 });
    }

    // Check expiry
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return NextResponse.json({ error: 'Authorization code expired' }, { status: 401 });
    }

    // Get user data
    const user = await getUser(payload.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate access token (long-lived for CLI)
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    const accessToken = createToken(
      {
        type: 'cli_access_token',
        userId: payload.userId,
        clerkId: payload.clerkId,
        email: payload.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(expiresAt / 1000),
      },
      secret(),
    );

    // Generate refresh token
    const refreshToken = createToken(
      {
        type: 'cli_refresh_token',
        userId: payload.userId,
        clerkId: payload.clerkId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor((Date.now() + 90 * 24 * 60 * 60 * 1000) / 1000), // 90 days
      },
      secret(),
    );

    return NextResponse.json({
      accessToken,
      refreshToken,
      expiresAt,
      user: {
        id: user.userId,
        email: payload.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error exchanging CLI auth code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
