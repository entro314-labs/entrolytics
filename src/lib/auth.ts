import { auth, currentUser } from '@clerk/nextjs/server'
import debug from 'debug'
import { ROLE_PERMISSIONS, ROLES, SHARE_TOKEN_HEADER } from '@/lib/constants'
import { parseToken } from '@/lib/jwt'
import { secret } from '@/lib/crypto'
import { ensureArray } from '@/lib/utils'
import { getUser, createUser } from '@/queries'

const log = debug('entrolytics:auth')

/**
 * Get current authenticated user
 *
 * Uses Clerk's auth() function and syncs user to local database.
 * This function assumes the route is already protected by middleware.
 *
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return null
    }

    // Get user from database using Clerk ID directly as primary key
    let user = await getUser(clerkUserId)

    // If user doesn't exist in our database, sync from Clerk
    if (!user) {
      const clerkUser = await currentUser()
      if (clerkUser) {
        user = await syncUserFromClerk(clerkUser)
      }
    }

    if (user) {
      user.isAdmin = user.role === ROLES.admin
    }

    return user
  } catch (error) {
    log('getCurrentUser error:', error)
    return null
  }
}

/**
 * Legacy checkAuth function for backward compatibility
 *
 * @param request - The incoming request (optional, for share token parsing)
 * @returns Authentication object with user, shareToken, and clerk data
 */
export async function checkAuth(request?: Request) {
  try {
    // During build time, Clerk auth might not be available
    if (
      !request ||
      !request.url ||
      typeof request.url !== 'string' ||
      process.env.NEXT_PHASE === 'phase-production-build'
    ) {
      return null
    }

    const { userId: clerkUserId, orgId } = await auth()
    const shareToken = request ? await parseShareToken(request.headers) : null

    if (process.env.NODE_ENV === 'development') {
      console.log('checkAuth:', {
        clerkUserId,
        orgId,
        shareToken,
        url: request?.url || 'build-time',
      })
    }

    // If no Clerk user and no share token, return null
    if (!clerkUserId && !shareToken) {
      log('checkAuth: User not authorized')
      return null
    }

    const user = clerkUserId ? await getCurrentUser() : null

    return {
      user,
      shareToken,
      clerkUserId,
      orgId,
    }
  } catch (error) {
    log('checkAuth error:', error)
    return null
  }
}

/**
 * Sync user data from Clerk to our database
 * Creates a new user record with Clerk data using Clerk ID as primary key
 */
async function syncUserFromClerk(clerkUser: any) {
  try {
    const userData = {
      id: clerkUser.id, // Use Clerk ID directly as primary key
      clerk_id: clerkUser.id, // Also set the clerk_id field for compatibility
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      role: ROLES.user, // Default role
      displayName:
        `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
        clerkUser.emailAddresses[0]?.emailAddress?.split('@')?.[0] ||
        'User',
    }

    const user = await createUser(userData)
    log('User synced from Clerk:', user.id)
    return user
  } catch (error) {
    log('Error syncing user from Clerk:', error)
    throw error
  }
}

/**
 * Check if user has specific permission(s)
 * Maintains the existing permission system
 */
export async function hasPermission(role: string, permission: string | string[]) {
  return ensureArray(permission).some((e) => ROLE_PERMISSIONS[role]?.includes(e))
}

/**
 * Parse share token from request headers
 * Maintains compatibility with existing share functionality
 */
export function parseShareToken(headers: Headers) {
  try {
    return parseToken(headers.get(SHARE_TOKEN_HEADER), secret())
  } catch (e) {
    log('Share token parse error:', e)
    return null
  }
}

/**
 * Entrolytics uses Clerk for all password and session management.
 * No additional auth utilities needed.
 */
