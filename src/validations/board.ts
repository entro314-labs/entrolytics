import { Auth } from '@/lib/types'
import { getBoard, getOrgUser } from '@/queries/drizzle'
import { hasPermission } from '@/lib/auth'
import { PERMISSIONS } from '@/lib/constants'

export async function canViewBoard({ user }: Auth, boardId: string) {
  if (user?.isAdmin) {
    return true
  }

  const board = await getBoard(boardId)

  if (!board) {
    return false
  }

  if (board.userId) {
    return user?.userId === board.userId
  }

  if (board.orgId) {
    const orgUser = await getOrgUser(board.orgId, user?.userId)

    return !!orgUser
  }

  return false
}

export async function canCreateBoard({ user }: Auth) {
  if (user?.isAdmin) {
    return true
  }

  return !!user?.userId
}

export async function canCreateOrgBoard({ user }: Auth, orgId: string) {
  if (user?.isAdmin) {
    return true
  }

  const orgUser = await getOrgUser(orgId, user?.userId)

  return orgUser && hasPermission(orgUser.role, PERMISSIONS.websiteCreate)
}

export async function canUpdateBoard({ user }: Auth, boardId: string) {
  if (user?.isAdmin) {
    return true
  }

  const board = await getBoard(boardId)

  if (!board) {
    return false
  }

  if (board.userId) {
    return user?.userId === board.userId
  }

  if (board.orgId) {
    const orgUser = await getOrgUser(board.orgId, user?.userId)

    return orgUser && hasPermission(orgUser.role, PERMISSIONS.websiteUpdate)
  }

  return false
}

export async function canDeleteBoard({ user }: Auth, boardId: string) {
  if (user?.isAdmin) {
    return true
  }

  const board = await getBoard(boardId)

  if (!board) {
    return false
  }

  if (board.userId) {
    return user?.userId === board.userId
  }

  if (board.orgId) {
    const orgUser = await getOrgUser(board.orgId, user?.userId)

    return orgUser && hasPermission(orgUser.role, PERMISSIONS.websiteDelete)
  }

  return false
}
