import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from '@/lib/constants'
import { ensureArray } from '@/lib/utils'

/**
 * Centralized permission management for Clerk RBAC
 * Following Clerk's best practices for role-based access control
 */

/**
 * Check if user has a specific platform role
 * Uses Clerk's publicMetadata to store and check roles
 */
export async function hasRole(role: string): Promise<boolean> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return false
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const userRole = user.publicMetadata?.role as string

    return userRole === role
  } catch (error) {
    console.error('Error checking role:', error)
    return false
  }
}

/**
 * Check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(ROLES.admin)
}

/**
 * Check if user has specific permission(s)
 * Supports both platform and organization-level permissions
 */
export async function hasPermission(permission: string | string[]): Promise<boolean> {
  try {
    const { userId, orgId, orgRole } = await auth()

    if (!userId) {
      return false
    }

    // Check if user is platform admin (has all permissions)
    if (await isAdmin()) {
      return true
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const userRole = user.publicMetadata?.role as string

    // Check platform-level permissions
    const platformPermissions = ROLE_PERMISSIONS[userRole] || []
    const hasPermissionFromRole = ensureArray(permission).some(
      (perm) => platformPermissions.includes(perm) || platformPermissions.includes(PERMISSIONS.all)
    )

    if (hasPermissionFromRole) {
      return true
    }

    // Check organization-level permissions if in org context
    if (orgId && orgRole) {
      const orgRolePermissions =
        ROLE_PERMISSIONS[`org${orgRole.charAt(0).toUpperCase()}${orgRole.slice(1)}`] || []
      return ensureArray(permission).some((perm) => orgRolePermissions.includes(perm))
    }

    return false
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

/**
 * Check if user has specific organization role
 * Uses Clerk's native organization system
 */
export async function hasOrgRole(requiredOrgId: string, role: string): Promise<boolean> {
  try {
    const { orgId, orgRole } = await auth()

    return orgId === requiredOrgId && orgRole === role
  } catch (error) {
    console.error('Error checking org role:', error)
    return false
  }
}

/**
 * Update user's platform role in Clerk publicMetadata
 * Should only be called by admin users
 */
export async function updateUserRole(userId: string, role: string): Promise<void> {
  try {
    // Verify caller is admin
    if (!(await isAdmin())) {
      throw new Error('Only admin users can update roles')
    }

    // Validate role exists
    if (!Object.values(ROLES).includes(role as any)) {
      throw new Error(`Invalid role: ${role}`)
    }

    const client = await clerkClient()
    await client.users.updateUser(userId, {
      publicMetadata: { role: role as 'admin' | 'user' | 'view-only' },
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}

/**
 * Get user's current platform role from Clerk
 */
export async function getCurrentUserRole(): Promise<string | null> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return null
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    return (user.publicMetadata?.role as string) || ROLES.user
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

/**
 * Get user's organization memberships with roles
 */
export async function getUserOrganizations() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return []
    }

    const client = await clerkClient()
    const organizationMemberships = await client.users.getOrganizationMembershipList({
      userId,
    })

    return organizationMemberships.data.map((membership) => ({
      orgId: membership.organization.id,
      orgName: membership.organization.name,
      role: membership.role,
      permissions: membership.permissions,
    }))
  } catch (error) {
    console.error('Error getting user organizations:', error)
    return []
  }
}

/**
 * Utility to check multiple permissions (OR logic)
 */
export async function hasAnyPermission(permissions: string[]): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(permission)) {
      return true
    }
  }
  return false
}

/**
 * Utility to check multiple permissions (AND logic)
 */
export async function hasAllPermissions(permissions: string[]): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(permission))) {
      return false
    }
  }
  return true
}

/**
 * Legacy compatibility: Check if user can perform action
 * Maintains compatibility with existing validation functions
 */
export async function canPerformAction(action: string, resourceId?: string): Promise<boolean> {
  switch (action) {
    case 'viewUsers':
      return hasRole(ROLES.admin)
    case 'createUser':
      return hasRole(ROLES.admin)
    case 'updateUser':
      return hasRole(ROLES.admin)
    case 'deleteUser':
      return hasRole(ROLES.admin)
    default:
      return hasPermission(action)
  }
}

/**
 * Get enhanced auth context with role information from Clerk
 * This provides a unified interface for checking authentication and roles
 */
export async function getAuthContext() {
  try {
    const { userId: clerkUserId, orgId, orgRole } = await auth()

    if (!clerkUserId) {
      return null
    }

    // Get platform role from Clerk's publicMetadata
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(clerkUserId)
    const platformRole = (clerkUser.publicMetadata?.role as string) || ROLES.user

    return {
      userId: clerkUserId,
      orgId: orgId || null,
      orgRole: orgRole || null,
      platformRole,
      isAdmin: platformRole === ROLES.admin,
    }
  } catch (error) {
    console.error('Error getting auth context:', error)
    return null
  }
}
