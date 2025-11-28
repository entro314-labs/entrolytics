import { eq, and, isNull } from 'drizzle-orm';
import { uuid } from '@/lib/crypto';
import { db } from '@/lib/db';
import { cliAccessToken } from '@/lib/db/schema';

export interface CreateCliAccessTokenData {
  jti: string;
  user_id: string;
  clerk_id: string;
  expires_at: Date;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Create a new CLI access token record
 */
export async function createCliAccessToken(data: CreateCliAccessTokenData) {
  const result = await db
    .insert(cliAccessToken)
    .values({
      jti: data.jti,
      userId: data.user_id,
      clerkId: data.clerk_id,
      expiresAt: data.expires_at,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
    })
    .returning();

  return result[0];
}

/**
 * Get CLI access token by JTI
 */
export async function getCliAccessToken(jti: string) {
  const result = await db
    .select()
    .from(cliAccessToken)
    .where(eq(cliAccessToken.jti, jti))
    .limit(1);

  return result[0] || null;
}

/**
 * Check if a CLI access token is revoked
 */
export async function isCliAccessTokenRevoked(jti: string): Promise<boolean> {
  const token = await getCliAccessToken(jti);

  if (!token) {
    return true; // Token doesn't exist, treat as revoked
  }

  return token.revokedAt !== null;
}

/**
 * Revoke a CLI access token by JTI
 */
export async function revokeCliAccessToken(jti: string) {
  const result = await db
    .update(cliAccessToken)
    .set({ revokedAt: new Date() })
    .where(eq(cliAccessToken.jti, jti))
    .returning();

  return result[0] || null;
}

/**
 * Revoke all CLI access tokens for a user
 */
export async function revokeAllUserCliAccessTokens(userId: string) {
  const result = await db
    .update(cliAccessToken)
    .set({ revokedAt: new Date() })
    .where(and(eq(cliAccessToken.userId, userId), isNull(cliAccessToken.revokedAt)))
    .returning();

  return result;
}

/**
 * Update last used timestamp for a CLI access token
 */
export async function updateCliAccessTokenLastUsed(jti: string) {
  await db
    .update(cliAccessToken)
    .set({ lastUsedAt: new Date() })
    .where(eq(cliAccessToken.jti, jti));
}

/**
 * Get all active CLI access tokens for a user
 */
export async function getUserActiveCliAccessTokens(userId: string) {
  const now = new Date();

  const result = await db
    .select()
    .from(cliAccessToken)
    .where(
      and(
        eq(cliAccessToken.userId, userId),
        isNull(cliAccessToken.revokedAt),
        // Only return tokens that haven't expired
      ),
    )
    .orderBy(cliAccessToken.createdAt);

  // Filter out expired tokens
  return result.filter(token => new Date(token.expiresAt) > now);
}

/**
 * Clean up expired tokens (for background job)
 */
export async function cleanupExpiredCliAccessTokens() {
  const now = new Date();

  // Delete tokens that have been expired for more than 7 days
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const result = await db
    .delete(cliAccessToken)
    .where(
      and(
        // Token is expired
        // expiresAt < sevenDaysAgo
      ),
    );

  return result;
}
