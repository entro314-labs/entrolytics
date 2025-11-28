import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';
import {
  getUserActiveCliAccessTokens,
  revokeCliAccessToken,
  revokeAllUserCliAccessTokens,
} from '@/queries/drizzle';

/**
 * GET /api/auth/cli/tokens
 * List all active CLI access tokens for the current user
 */
export async function GET(request: NextRequest) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const tokens = await getUserActiveCliAccessTokens(auth.user.userId);

  // Return sanitized token info (don't expose the actual token)
  const sanitizedTokens = tokens.map(token => ({
    jti: token.jti,
    createdAt: token.createdAt,
    expiresAt: token.expiresAt,
    lastUsedAt: token.lastUsedAt,
    ipAddress: token.ipAddress,
    userAgent: token.userAgent,
  }));

  return json(sanitizedTokens);
}

/**
 * DELETE /api/auth/cli/tokens
 * Revoke CLI access token(s)
 *
 * Can revoke a specific token by JTI or all tokens for the user
 */
export async function DELETE(request: NextRequest) {
  const schema = z.object({
    jti: z.string().uuid().optional(),
    revokeAll: z.boolean().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { jti, revokeAll } = body;

  // Must specify either jti or revokeAll
  if (!jti && !revokeAll) {
    return NextResponse.json(
      { error: 'Must specify either jti or revokeAll' },
      { status: 400 },
    );
  }

  if (revokeAll) {
    // Revoke all tokens for the user
    const revokedTokens = await revokeAllUserCliAccessTokens(auth.user.userId);

    return json({
      success: true,
      message: `Revoked ${revokedTokens.length} token(s)`,
      revokedCount: revokedTokens.length,
    });
  }

  if (jti) {
    // Revoke specific token
    // First verify the token belongs to the user
    const tokens = await getUserActiveCliAccessTokens(auth.user.userId);
    const tokenBelongsToUser = tokens.some(t => t.jti === jti);

    if (!tokenBelongsToUser) {
      return NextResponse.json(
        { error: 'Token not found or does not belong to you' },
        { status: 404 },
      );
    }

    const revokedToken = await revokeCliAccessToken(jti);

    if (!revokedToken) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    return json({
      success: true,
      message: 'Token revoked successfully',
      jti: revokedToken.jti,
    });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
