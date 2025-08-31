import { auth, currentUser } from '@clerk/nextjs/server';
import debug from 'debug';
import { ROLE_PERMISSIONS, ROLES, SHARE_TOKEN_HEADER } from '@/lib/constants';
import { parseToken } from '@/lib/jwt';
import { secret } from '@/lib/crypto';
import { ensureArray } from '@/lib/utils';
import { getUserByClerkId, createUser } from '@/queries';

const log = debug('entrolytics:auth');

/**
 * Entrolytics Authentication Check
 * 
 * Built on Clerk for modern, secure authentication.
 * Automatically syncs users from Clerk to our database.
 * 
 * @param request - The incoming request
 * @returns Authentication object with user, shareToken, and clerk data
 */
export async function checkAuth(request: Request) {
  try {
    const { userId: clerkUserId, orgId } = await auth();
    const shareToken = await parseShareToken(request.headers);
    
    if (process.env.NODE_ENV === 'development') {
      log('checkAuth:', { clerkUserId, orgId, shareToken });
    }

    // If no Clerk user and no share token, return null
    if (!clerkUserId && !shareToken) {
      log('checkAuth: User not authorized');
      return null;
    }

    let user = null;
    if (clerkUserId) {
      // Get user from database by Clerk ID
      user = await getUserByClerkId(clerkUserId);
      
      // If user doesn't exist in our database, sync from Clerk
      if (!user) {
        const clerkUser = await currentUser();
        if (clerkUser) {
          user = await syncUserFromClerk(clerkUser);
        }
      }
      
      if (user) {
        user.isAdmin = user.role === ROLES.admin;
      }
    }

    return {
      user,
      shareToken,
      clerkUserId,
      orgId,
    };
  } catch (error) {
    log('checkAuth error:', error);
    return null;
  }
}

/**
 * Sync user data from Clerk to our database
 * Creates a new user record with Clerk data
 */
async function syncUserFromClerk(clerkUser: any) {
  try {
    const userData = {
      id: crypto.randomUUID(),
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      role: ROLES.user, // Default role
      displayName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 
                   clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || 
                   'User',
    };

    const user = await createUser(userData);
    log('User synced from Clerk:', user.id);
    return user;
  } catch (error) {
    log('Error syncing user from Clerk:', error);
    throw error;
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
 * Parse share token from request headers
 * Maintains compatibility with existing share functionality
 */
export function parseShareToken(headers: Headers) {
  try {
    return parseToken(headers.get(SHARE_TOKEN_HEADER), secret());
  } catch (e) {
    log('Share token parse error:', e);
    return null;
  }
}

/**
 * Entrolytics uses Clerk for all password and session management.
 * No additional auth utilities needed.
 */
