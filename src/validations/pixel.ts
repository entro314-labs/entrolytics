import { Auth } from '@/lib/types'
import { getPixel, getOrgUser } from '@/queries/drizzle'
import { hasPermission } from '@/lib/auth'
import { PERMISSIONS } from '@/lib/constants'

export async function canViewPixel({ user }: Auth, pixelId: string) {
  if (user?.isAdmin) {
    return true
  }

  const pixel = await getPixel(pixelId)

  if (pixel.userId) {
    return user?.userId === pixel.userId
  }

  if (pixel.orgId) {
    const orgUser = await getOrgUser(pixel.orgId, user?.userId)

    return !!orgUser
  }

  return false
}

export async function canUpdatePixel({ user }: Auth, pixelId: string) {
  if (user?.isAdmin) {
    return true
  }

  const pixel = await getPixel(pixelId)

  if (pixel.userId) {
    return user?.userId === pixel.userId
  }

  if (pixel.orgId) {
    const orgUser = await getOrgUser(pixel.orgId, user?.userId)

    return orgUser && hasPermission(orgUser.role, PERMISSIONS.websiteUpdate)
  }

  return false
}

export async function canDeletePixel({ user }: Auth, pixelId: string) {
  if (user?.isAdmin) {
    return true
  }

  const pixel = await getPixel(pixelId)

  if (pixel.userId) {
    return user?.userId === pixel.userId
  }

  if (pixel.orgId) {
    const orgUser = await getOrgUser(pixel.orgId, user?.userId)

    return orgUser && hasPermission(orgUser.role, PERMISSIONS.websiteDelete)
  }

  return false
}
