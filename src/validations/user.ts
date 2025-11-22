import { Auth } from '@/lib/types'
import { hasRole, hasPermission, isAdmin, getAuthContext } from '@/lib/permissions'
import { ROLES, PERMISSIONS } from '@/lib/constants'

export async function canCreateUser({ user }: Auth) {
  return user?.isAdmin || (await hasRole(ROLES.admin))
}

export async function canViewUser(auth: Auth, viewedUserId: string) {
  const { user, clerkUserId } = auth

  // Admin can view any user
  if (user?.isAdmin || (await isAdmin())) {
    return true
  }

  // Users can view their own profile
  const isClerkId = viewedUserId.startsWith('user_')
  const userIdToCompare = isClerkId ? clerkUserId : user?.userId

  return userIdToCompare === viewedUserId
}

export async function canViewUsers({ user }: Auth) {
  return user?.isAdmin || (await hasRole(ROLES.admin))
}

export async function canUpdateUser(auth: Auth, viewedUserId: string) {
  const { user, clerkUserId } = auth

  // Admin can update any user
  if (user?.isAdmin || (await isAdmin())) {
    return true
  }

  // Users can update their own profile
  const isClerkId = viewedUserId.startsWith('user_')
  const userIdToCompare = isClerkId ? clerkUserId : user?.userId

  return userIdToCompare === viewedUserId
}

export async function canDeleteUser({ user }: Auth) {
  return user?.isAdmin || (await hasRole(ROLES.admin))
}
