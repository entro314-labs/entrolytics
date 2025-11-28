import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import debug from 'debug';
import { headers } from 'next/headers';
import { ROLE_PERMISSIONS, ROLES, SHARE_TOKEN_HEADER } from '@/lib/constants';
import { secret, uuid } from '@/lib/crypto';
import type { User } from '@/lib/db';
import { parseToken } from '@/lib/jwt';
import type { Role } from '@/lib/types';
import { ensureArray } from '@/lib/utils';
import {
  isCliAccessTokenRevoked,
  updateCliAccessTokenLastUsed,
} from '@/queries/drizzle/cli-token';
import { createUser, getUser, getUserByClerkId } from '@/queries/drizzle/user';
import { getSharedWebsite } from '@/queries/drizzle/website';
import type { AuthContext, PlatformRole } from '@/types/clerk';

// Enhanced user type with computed properties
type EnhancedUser = User & {
  isAdmin?: boolean;
  platformRole?: PlatformRole;
  orgId?: string | null;
  orgRole?: string | null;
};

const log = debug('entrolytics:auth');

/**
 * CLI Token payload structure
 */
interface CliTokenPayload {
  type: 'cli_access_token';
  jti: string; // JWT ID for revocation tracking
  userId: string;
  clerkId: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Try to authenticate via CLI Bearer token
 * Returns user if valid CLI token, null otherwise
 *
 * SECURITY: Validates token against both database AND Clerk to prevent
 * stale tokens from being used after account disable/role change
 */
async function authenticateCliToken(): Promise<EnhancedUser | null> {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.slice(7);
    const payload = parseToken(token, secret()) as CliTokenPayload | null;

    if (!payload || payload.type !== 'cli_access_token') {
      return null;
    }

    // Check expiry
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      log('CLI token expired');
      return null;
    }

    // SECURITY: Check if token has been revoked
    if (!payload.jti) {
      log('CLI token missing JTI - legacy token, rejecting');
      return null;
    }

    const isRevoked = await isCliAccessTokenRevoked(payload.jti);
    if (isRevoked) {
      log('CLI token has been revoked:', payload.jti);
      return null;
    }

    // Get user from database
    const user = await getUser(payload.userId);

    if (!user) {
      log('CLI token user not found:', payload.userId);
      return null;
    }

    // SECURITY: Check if user is soft-deleted
    if (user.deletedAt) {
      log('CLI token user is deleted:', payload.userId);
      return null;
    }

    // SECURITY: Validate against Clerk to check if user is banned/disabled
    // and to get the authoritative role (Clerk is source of truth)
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(payload.clerkId);

    if (!clerkUser) {
      log('CLI token Clerk user not found:', payload.clerkId);
      return null;
    }

    // Check if user is banned/disabled in Clerk
    if (clerkUser.banned) {
      log('CLI token user is banned in Clerk:', payload.clerkId);
      return null;
    }

    // Get authoritative role from Clerk's publicMetadata
    const platformRole = (clerkUser.publicMetadata?.role as PlatformRole) || ROLES.user;

    // Update last used timestamp (fire and forget - don't await)
    updateCliAccessTokenLastUsed(payload.jti).catch(err =>
      log('Failed to update CLI token last used:', err),
    );

    log('Authenticated via CLI token:', user.email, 'role:', platformRole);

    return {
      ...user,
      isAdmin: platformRole === ROLES.admin,
      platformRole,
      orgId: null,
      orgRole: null,
    } as EnhancedUser;
  } catch (error) {
    log('CLI token auth error:', error);
    return null;
  }
}

/**
 * Get current authenticated user with enhanced role information
 *
 * Supports both:
 * 1. Clerk session authentication (browser/web)
 * 2. CLI Bearer token authentication (CLI tools)
 *
 * @returns Enhanced user object with role information or null if not authenticated
 */
export async function getCurrentUser(): Promise<EnhancedUser | null> {
  try {
    // First, try CLI token authentication
    const cliUser = await authenticateCliToken();
    if (cliUser) {
      return cliUser;
    }

    // Fall back to Clerk session authentication
    const { userId: clerkUserId, orgId, orgRole } = await auth();

    if (!clerkUserId) {
      return null;
    }

    // Get Clerk user data including publicMetadata
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);
    const platformRole = (clerkUser.publicMetadata?.role as PlatformRole) || ROLES.user;

    // Get user from database using Clerk ID
    let user = await getUserByClerkId(clerkUserId);

    // If user doesn't exist in our database, sync from Clerk
    // With retry logic to handle webhook race conditions
    if (!user) {
      const currentClerkUser = await currentUser();
      if (currentClerkUser) {
        // Try to sync, but also check if webhook beat us to it
        user = await syncUserFromClerk(currentClerkUser, platformRole);

        // If sync failed, wait a bit and retry (webhook might be processing)
        if (!user) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          user = await getUserByClerkId(clerkUserId);
        }
      }
    } else {
      // Update role from Clerk's publicMetadata if different
      if (user.role !== platformRole) {
        user.role = platformRole;
        // Could update database here if needed for consistency
      }
    }

    if (user) {
      // Return enhanced user object with computed properties
      return {
        ...user,
        isAdmin: platformRole === ROLES.admin,
        platformRole,
        orgId: orgId || null,
        orgRole: orgRole || null,
      } as EnhancedUser;
    }

    return null;
  } catch (error) {
    log('getCurrentUser error:', error);
    return null;
  }
}

/**
 * Sync user data from Clerk to our database
 * Creates a new user record with Clerk data using Clerk ID as primary key
 * Now takes role from Clerk's publicMetadata for consistency
 */
async function syncUserFromClerk(
  clerkUser: any,
  platformRole?: PlatformRole,
): Promise<User | null> {
  try {
    // First check if webhook already created the user
    const existingUser = await getUserByClerkId(clerkUser.id);
    if (existingUser) {
      log('User already exists (likely from webhook), using existing:', existingUser.userId);
      return existingUser as User;
    }

    const userData = {
      user_id: uuid(), // Generate proper UUID for primary key
      clerk_id: clerkUser.id, // Store Clerk ID in clerk_id field
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      first_name: clerkUser.firstName || null,
      last_name: clerkUser.lastName || null,
      image_url: clerkUser.imageUrl || null,
      role: (platformRole ||
        (clerkUser.publicMetadata?.role as PlatformRole) ||
        ROLES.user) as Role,
      display_name:
        `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
        clerkUser.emailAddresses[0]?.emailAddress?.split('@')?.[0] ||
        'User',
    };

    const newUser = await createUser(userData);
    log('User synced from Clerk:', newUser.userId);

    // Get the full user object from database after creation
    const fullUser = await getUserByClerkId(clerkUser.id);
    if (!fullUser) {
      throw new Error('Failed to retrieve created user from database');
    }

    return fullUser as User;
  } catch (error) {
    log('Error syncing user from Clerk:', error);
    // Check if it's a duplicate key error (webhook beat us)
    if (error instanceof Error && error.message.includes('duplicate')) {
      const user = await getUserByClerkId(clerkUser.id);
      if (user) {
        log('User created by webhook during sync attempt, using existing');
        return user as User;
      }
    }
    return null;
  }
}

/**
 * Check if user has specific permission(s)
 * Maintains the existing permission system
 */
export async function hasPermission(role: string, permission: string | string[]) {
  return ensureArray(permission).some(e => ROLE_PERMISSIONS[role]?.includes(e));
}

/**
 * Share token payload structure
 */
interface ShareTokenPayload {
  type: 'share_token';
  websiteId: string;
  shareId: string;
  exp: number;
}

/**
 * Parse and validate share token from request headers
 * SECURITY: Validates token type, expiry, and shareId binding
 *
 * Note: This function only parses and validates the token structure.
 * The caller must verify that the website still has this shareId
 * (to handle share revocation).
 */
export function parseShareToken(headers: Headers): ShareTokenPayload | null {
  try {
    const tokenString = headers.get(SHARE_TOKEN_HEADER);

    if (!tokenString) {
      return null;
    }

    const payload = parseToken(tokenString, secret()) as ShareTokenPayload | null;

    if (!payload || payload.type !== 'share_token') {
      log('Invalid share token type');
      return null;
    }

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      log('Share token expired');
      return null;
    }

    // Validate required fields
    if (!payload.websiteId || !payload.shareId) {
      log('Share token missing required fields');
      return null;
    }

    return payload;
  } catch (e) {
    log('Share token parse error:', e);
    return null;
  }
}

/**
 * Validate share token access by checking if the website still has the shareId
 * SECURITY: Ensures tokens can be revoked by checking current shareId
 *
 * @param shareToken - The parsed share token payload
 * @returns true if the share is still valid, false if revoked or invalid
 */
export async function validateShareAccess(shareToken: ShareTokenPayload): Promise<boolean> {
  try {
    const website = await getSharedWebsite(shareToken.shareId);

    // Share has been revoked if:
    // 1. Website with this shareId doesn't exist
    // 2. Website ID doesn't match the token's websiteId
    if (!website || website.websiteId !== shareToken.websiteId) {
      log('Share token revoked or invalid:', shareToken.shareId);
      return false;
    }

    return true;
  } catch (e) {
    log('Share token validation error:', e);
    return false;
  }
}

/**
 * Get enhanced auth context with role information from Clerk
 * This provides a unified interface for checking authentication and roles
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const { userId: clerkUserId, orgId, orgRole } = await auth();

    if (!clerkUserId) {
      return null;
    }

    // Get platform role from Clerk's publicMetadata
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);
    const platformRole = (clerkUser.publicMetadata?.role as PlatformRole) || ROLES.user;

    return {
      userId: clerkUserId,
      orgId: orgId || null,
      orgRole: (orgRole as any) || null,
      platformRole,
      isAdmin: platformRole === ROLES.admin,
    };
  } catch (error) {
    log('Error getting auth context:', error);
    return null;
  }
}

/**
 * Entrolytics now uses Clerk with enhanced RBAC for authentication and authorization.
 * Platform roles are stored in Clerk's publicMetadata.
 * Organization roles use Clerk's native organization system.
 */
