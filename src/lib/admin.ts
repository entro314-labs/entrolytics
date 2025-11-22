import { ROLES } from '@/lib/constants'
import { getUserByEmail, getUsers, updateUser } from '@/queries/drizzle'
import { eq, sql } from 'drizzle-orm'
import { db, user } from '@/lib/db'

/**
 * Admin bootstrap utilities for Entrolytics
 * Handles initial admin setup and auto-promotion logic
 */

export interface AdminSetupConfig {
  initialAdminEmail?: string
  autoPromoteFirstUser?: boolean
}

/**
 * Get admin setup configuration from environment variables
 */
export function getAdminSetupConfig(): AdminSetupConfig {
  return {
    initialAdminEmail: process.env.INITIAL_ADMIN_EMAIL?.toLowerCase(),
    autoPromoteFirstUser: process.env.AUTO_PROMOTE_FIRST_USER === 'true',
  }
}

/**
 * Check if any admin users exist in the system
 */
export async function hasAdminUsers(): Promise<boolean> {
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(eq(user.role, ROLES.admin))

    return result.count > 0
  } catch (error) {
    console.error('Error checking for admin users:', error)
    return false
  }
}

/**
 * Get total number of users in the system
 */
export async function getTotalUserCount(): Promise<number> {
  try {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(user)

    return result.count
  } catch (error) {
    console.error('Error getting total user count:', error)
    return 0
  }
}

/**
 * Check if a user should be auto-promoted to admin
 * Conditions:
 * 1. User email matches INITIAL_ADMIN_EMAIL, OR
 * 2. AUTO_PROMOTE_FIRST_USER is true and no admin users exist and this is the first user
 */
export async function shouldPromoteToAdmin(userEmail: string): Promise<boolean> {
  const config = getAdminSetupConfig()
  const normalizedEmail = userEmail.toLowerCase()

  // Check if email matches initial admin email
  if (config.initialAdminEmail && normalizedEmail === config.initialAdminEmail) {
    console.log(
      `🔐 Auto-promoting user with email ${userEmail} to admin (matches INITIAL_ADMIN_EMAIL)`
    )
    return true
  }

  // Check if this should be auto-promoted as first user
  if (config.autoPromoteFirstUser) {
    const [hasAdmins, totalUsers] = await Promise.all([hasAdminUsers(), getTotalUserCount()])

    if (!hasAdmins && totalUsers <= 1) {
      console.log(
        `🔐 Auto-promoting first user ${userEmail} to admin (AUTO_PROMOTE_FIRST_USER enabled)`
      )
      return true
    }
  }

  return false
}

/**
 * Promote a user to admin role by user ID
 */
export async function promoteUserToAdmin(userId: string): Promise<boolean> {
  try {
    const updatedUser = await updateUser(userId, { role: ROLES.admin })

    if (updatedUser) {
      console.log(`✅ Successfully promoted user ${userId} to admin`)
      return true
    }

    console.error(`❌ Failed to promote user ${userId} to admin - user not found`)
    return false
  } catch (error) {
    console.error(`❌ Error promoting user ${userId} to admin:`, error)
    return false
  }
}

/**
 * Promote a user to admin role by email address
 */
export async function promoteUserToAdminByEmail(email: string): Promise<boolean> {
  try {
    const existingUser = await getUserByEmail(email)

    if (!existingUser) {
      console.error(`❌ User with email ${email} not found`)
      return false
    }

    return await promoteUserToAdmin(existingUser.userId)
  } catch (error) {
    console.error(`❌ Error promoting user with email ${email} to admin:`, error)
    return false
  }
}

/**
 * Bootstrap admin setup - called during user creation
 * This function should be called whenever a new user is created
 */
export async function bootstrapAdminSetup(userEmail: string, userId: string): Promise<void> {
  try {
    const shouldPromote = await shouldPromoteToAdmin(userEmail)

    if (shouldPromote) {
      await promoteUserToAdmin(userId)
    }
  } catch (error) {
    console.error('Error during admin bootstrap setup:', error)
    // Don't throw - this should not block user creation
  }
}

/**
 * Validate admin setup configuration
 */
export function validateAdminSetupConfig(): {
  valid: boolean
  errors: string[]
} {
  const config = getAdminSetupConfig()
  const errors: string[] = []

  if (config.initialAdminEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(config.initialAdminEmail)) {
      errors.push('INITIAL_ADMIN_EMAIL is not a valid email address')
    }
  }

  if (!config.initialAdminEmail && !config.autoPromoteFirstUser) {
    errors.push(
      'Either INITIAL_ADMIN_EMAIL or AUTO_PROMOTE_FIRST_USER should be configured to ensure admin access'
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get admin setup status for diagnostics
 */
export async function getAdminSetupStatus() {
  const config = getAdminSetupConfig()
  const [hasAdmins, totalUsers] = await Promise.all([hasAdminUsers(), getTotalUserCount()])

  return {
    config,
    hasAdminUsers: hasAdmins,
    totalUsers,
    setupComplete: hasAdmins || config.initialAdminEmail || config.autoPromoteFirstUser,
  }
}
