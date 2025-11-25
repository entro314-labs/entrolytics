/**
 * Edge-compatible JWT functions using jose library
 *
 * This module provides the same functionality as jwt.ts but uses
 * the jose library which is Web Crypto API compatible and works
 * on Edge Runtime (Vercel Edge, Cloudflare Workers, etc.)
 *
 * Only 2 functions needed (createToken, parseToken):
 * - createSecureToken and parseSecureToken were unused and deleted
 * - User authentication is handled by Clerk, not JWT
 * - These JWTs are only for session caching and share tokens
 */

import { type JWTPayload, jwtVerify, SignJWT } from 'jose';

/**
 * Parse expiration string to seconds
 * Supports formats like "1h", "7d", "30m", "1y"
 */
function parseExpiration(exp: string): string {
  const match = exp.match(/^(\d+)([smhdwy])$/);
  if (!match) return exp;

  const [, num, unit] = match;
  const value = parseInt(num, 10);

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800,
    y: 31536000,
  };

  const seconds = value * (multipliers[unit] || 1);
  return `${seconds}s`;
}

/**
 * Create a JWT token
 * @param payload - Data to encode in the token
 * @param secret - Secret key for signing
 * @param options - Optional settings (expiresIn)
 */
export async function createToken(
  payload: JWTPayload,
  secret: string,
  options?: { expiresIn?: string },
): Promise<string> {
  const key = new TextEncoder().encode(secret);

  const jwt = new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt();

  if (options?.expiresIn) {
    jwt.setExpirationTime(parseExpiration(options.expiresIn));
  }

  return jwt.sign(key);
}

/**
 * Parse and verify a JWT token
 * @param token - JWT string to verify
 * @param secret - Secret key used for signing
 * @returns Decoded payload or null if invalid
 */
export async function parseToken(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch {
    return null;
  }
}
