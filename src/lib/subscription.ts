import redis from '@/lib/redis'
import { clerkClient } from '@clerk/nextjs/server'
import { EDGE_WEBSITE_LIMIT } from '@/lib/constants'

export interface AccountCache {
  hasSubscription: boolean
  plan: 'free' | 'pro' | 'enterprise'
  websiteLimit: number
}

const CACHE_TTL_SECONDS = 300 // 5 minutes

/**
 * Get account subscription info from cache or Clerk metadata
 * Used in edge mode to check subscription status and limits
 */
export async function getAccountSubscription(userId: string): Promise<AccountCache | null> {
  if (!process.env.EDGE_MODE) {
    return null
  }

  // Try to get from Redis cache first
  if (redis.client) {
    try {
      const cached = await redis.client.get<AccountCache>(`account:${userId}`)
      if (cached) {
        return cached
      }
    } catch {
      // Cache miss or error, continue to fetch from Clerk
    }
  }

  // Fetch from Clerk metadata
  try {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)

    const plan = (user.publicMetadata?.plan as AccountCache['plan']) || 'free'
    const hasSubscription = !!user.publicMetadata?.subscription

    const account: AccountCache = {
      hasSubscription,
      plan,
      websiteLimit: plan === 'free' ? EDGE_WEBSITE_LIMIT : Number.POSITIVE_INFINITY,
    }

    // Cache for 5 minutes
    if (redis.client) {
      try {
        await redis.client.set(`account:${userId}`, account, { EX: CACHE_TTL_SECONDS })
      } catch {
        // Cache write failed, continue without caching
      }
    }

    return account
  } catch {
    return null
  }
}

/**
 * Check if user can create more websites based on subscription
 */
export async function canCreateMoreWebsites(
  userId: string,
  currentWebsiteCount: number
): Promise<boolean> {
  if (!process.env.EDGE_MODE) {
    return true
  }

  const account = await getAccountSubscription(userId)

  if (!account) {
    // Fallback to free tier limit if can't get subscription info
    return currentWebsiteCount < EDGE_WEBSITE_LIMIT
  }

  return currentWebsiteCount < account.websiteLimit
}

/**
 * Invalidate cached subscription data (call after subscription changes)
 */
export async function invalidateAccountCache(userId: string): Promise<void> {
  if (redis.client) {
    try {
      await redis.client.del(`account:${userId}`)
    } catch {
      // Ignore cache deletion errors
    }
  }
}
