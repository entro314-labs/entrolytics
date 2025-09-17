import { Auth } from '@/lib/types'
import { getLink, getOrgUser } from '@/queries'
import { hasPermission } from '@/lib/auth'
import { PERMISSIONS } from '@/lib/constants'

export async function canViewLink({ user }: Auth, linkId: string) {
  if (user?.isAdmin) {
    return true
  }

  const link = await getLink(linkId)

  if (link.userId) {
    return user.id === link.userId
  }

  if (link.orgId) {
    const orgUser = await getOrgUser(link.orgId, user.id)

    return !!orgUser
  }

  return false
}

export async function canUpdateLink({ user }: Auth, linkId: string) {
  if (user.isAdmin) {
    return true
  }

  const link = await getLink(linkId)

  if (link.userId) {
    return user.id === link.userId
  }

  if (link.orgId) {
    const orgUser = await getOrgUser(link.orgId, user.id)

    return orgUser && hasPermission(orgUser.role, PERMISSIONS.websiteUpdate)
  }

  return false
}

export async function canDeleteLink({ user }: Auth, linkId: string) {
  if (user.isAdmin) {
    return true
  }

  const link = await getLink(linkId)

  if (link.userId) {
    return user.id === link.userId
  }

  if (link.orgId) {
    const orgUser = await getOrgUser(link.orgId, user.id)

    return orgUser && hasPermission(orgUser.role, PERMISSIONS.websiteDelete)
  }

  return false
}
