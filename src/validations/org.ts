import { Auth } from '@/lib/types'
import { PERMISSIONS } from '@/lib/constants'
import { getOrgUser } from '@/queries'
import { hasPermission } from '@/lib/auth'

const cloudMode = !!process.env.CLOUD_MODE

export async function canViewOrg({ user }: Auth, orgId: string) {
  if (user.isAdmin) {
    return true
  }

  return getOrgUser(orgId, user.id)
}

export async function canCreateOrg({ user, grant }: Auth) {
  if (cloudMode) {
    return !!grant?.find((a) => a === PERMISSIONS.orgCreate)
  }

  if (user.isAdmin) {
    return true
  }

  return !!user
}

export async function canUpdateOrg({ user, grant }: Auth, orgId: string) {
  if (user.isAdmin) {
    return true
  }

  if (cloudMode) {
    return !!grant?.find((a) => a === PERMISSIONS.orgUpdate)
  }

  const orgUser = await getOrgUser(orgId, user.id)

  return orgUser && hasPermission(orgUser.role, PERMISSIONS.orgUpdate)
}

export async function canDeleteOrg({ user }: Auth, orgId: string) {
  if (user.isAdmin) {
    return true
  }

  const orgUser = await getOrgUser(orgId, user.id)

  return orgUser && hasPermission(orgUser.role, PERMISSIONS.orgDelete)
}

export async function canAddUserToOrg({ user, grant }: Auth) {
  if (cloudMode) {
    return !!grant?.find((a) => a === PERMISSIONS.orgUpdate)
  }

  return user.isAdmin
}

export async function canDeleteOrgUser({ user }: Auth, orgId: string, removeUserId: string) {
  if (user.isAdmin) {
    return true
  }

  if (removeUserId === user.id) {
    return true
  }

  const orgUser = await getOrgUser(orgId, user.id)

  return orgUser && hasPermission(orgUser.role, PERMISSIONS.orgUpdate)
}

export async function canCreateOrgWebsite({ user }: Auth, orgId: string) {
  if (user.isAdmin) {
    return true
  }

  const orgUser = await getOrgUser(orgId, user.id)

  return orgUser && hasPermission(orgUser.role, PERMISSIONS.websiteCreate)
}

export async function canViewAllOrgs({ user }: Auth) {
  return user.isAdmin
}
