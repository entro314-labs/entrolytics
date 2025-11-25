/**
 * CLI Token Service
 *
 * Handles generation, validation, and management of CLI setup tokens
 */

import { randomBytes } from 'crypto';
import { and, eq, gt, lt, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { type CliSetupToken, cliSetupToken } from '@/lib/db/schema';

export interface CreateTokenParams {
  userId: string;
  websiteId: string;
  orgId?: string;
  purpose?: 'cli-init' | 'cli-update';
  expiresInMinutes?: number;
}

export interface TokenValidationResult {
  valid: boolean;
  token?: CliSetupToken;
  error?: string;
}

export class CliTokenService {
  /**
   * Generate a cryptographically secure token
   */
  private static generateToken(): string {
    return randomBytes(64).toString('base64url');
  }

  /**
   * Create a new CLI setup token
   */
  static async createToken(params: CreateTokenParams): Promise<CliSetupToken> {
    const token = CliTokenService.generateToken();
    const expiresInMinutes = params.expiresInMinutes || 15;

    const [newToken] = await db
      .insert(cliSetupToken)
      .values({
        token,
        userId: params.userId,
        websiteId: params.websiteId,
        orgId: params.orgId,
        purpose: params.purpose || 'cli-init',
        expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
        status: 'pending',
      })
      .returning();

    return newToken;
  }

  /**
   * Validate and consume a token
   */
  static async validateToken(
    token: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenValidationResult> {
    const now = new Date();

    // Find token
    const [tokenRecord] = await db
      .select()
      .from(cliSetupToken)
      .where(eq(cliSetupToken.token, token))
      .limit(1);

    if (!tokenRecord) {
      return { valid: false, error: 'Token not found' };
    }

    // Check if already used
    if (tokenRecord.status === 'used') {
      return { valid: false, error: 'Token already used' };
    }

    // Check if revoked
    if (tokenRecord.status === 'revoked') {
      return { valid: false, error: 'Token revoked' };
    }

    // Check expiration
    if (now > tokenRecord.expiresAt) {
      // Update status
      await db
        .update(cliSetupToken)
        .set({ status: 'expired' })
        .where(eq(cliSetupToken.tokenId, tokenRecord.tokenId));

      return { valid: false, error: 'Token expired' };
    }

    // Mark as used
    await db
      .update(cliSetupToken)
      .set({
        status: 'used',
        usedAt: now,
        ipAddress,
        userAgent,
      })
      .where(eq(cliSetupToken.tokenId, tokenRecord.tokenId));

    return { valid: true, token: tokenRecord };
  }

  /**
   * Get active tokens for a user
   */
  static async getUserTokens(userId: string): Promise<CliSetupToken[]> {
    const now = new Date();

    return db
      .select()
      .from(cliSetupToken)
      .where(
        and(
          eq(cliSetupToken.userId, userId),
          eq(cliSetupToken.status, 'pending'),
          gt(cliSetupToken.expiresAt, now),
        ),
      )
      .orderBy(cliSetupToken.createdAt);
  }

  /**
   * Revoke a token
   */
  static async revokeToken(tokenId: string): Promise<void> {
    await db
      .update(cliSetupToken)
      .set({ status: 'revoked' })
      .where(eq(cliSetupToken.tokenId, tokenId));
  }

  /**
   * Cleanup expired tokens (run via cron)
   */
  static async cleanupExpiredTokens(): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await db
      .delete(cliSetupToken)
      .where(and(eq(cliSetupToken.status, 'expired'), lt(cliSetupToken.expiresAt, oneDayAgo)));

    return result.rowCount || 0;
  }

  /**
   * Get token statistics for monitoring
   */
  static async getTokenStats(): Promise<{
    totalActive: number;
    totalExpired: number;
    totalUsed: number;
    totalRevoked: number;
  }> {
    const result = await db.execute(sql`
      SELECT
        status,
        COUNT(*) as count
      FROM cli_setup_token
      GROUP BY status
    `);

    const stats = {
      totalActive: 0,
      totalExpired: 0,
      totalUsed: 0,
      totalRevoked: 0,
    };

    for (const row of result.rows) {
      const status = (row as any).status;
      const count = Number((row as any).count);

      switch (status) {
        case 'pending':
          stats.totalActive = count;
          break;
        case 'expired':
          stats.totalExpired = count;
          break;
        case 'used':
          stats.totalUsed = count;
          break;
        case 'revoked':
          stats.totalRevoked = count;
          break;
      }
    }

    return stats;
  }
}
