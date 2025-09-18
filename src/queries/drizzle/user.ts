import { eq, and, or, ilike, isNull, inArray } from 'drizzle-orm'
import {
  db,
  user,
  website,
  org,
  orgUser,
  eventData,
  sessionData,
  websiteEvent,
  session,
  report,
} from '@/lib/db'
import { ROLES } from '@/lib/constants'
import { PageResult, Role, QueryFilters } from '@/lib/types'

export interface GetUserOptions {
  showDeleted?: boolean
}

async function findUser(where: any, options: GetUserOptions = {}) {
  const { showDeleted = false } = options

  const conditions = [where]
  if (!showDeleted) {
    conditions.push(isNull(user.deletedAt))
  }

  return db
    .select({
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      displayName: user.displayName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(and(...conditions))
    .limit(1)
    .then((rows) => rows[0] || null)
}

export async function getUser(userId: string, options: GetUserOptions = {}) {
  return findUser(eq(user.userId, userId), options)
}

export async function getUserByClerkId(clerkId: string, options: GetUserOptions = {}) {
  return findUser(eq(user.clerkId, clerkId), options)
}

export async function getUserByEmail(email: string, options: GetUserOptions = {}) {
  const { showDeleted = false } = options

  const conditions = [eq(user.email, email)]
  if (!showDeleted) {
    conditions.push(isNull(user.deletedAt))
  }

  return db
    .select({
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      displayName: user.displayName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(and(...conditions))
    .limit(1)
    .then((rows) => rows[0] || null)
}

export async function getUsers(
  whereClause: any = {},
  filters: QueryFilters = {}
): Promise<PageResult<any[]>> {
  const { search, page = 1, pageSize = 20, orderBy = 'createdAt', sortDescending = true } = filters

  let query = db
    .select({
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      displayName: user.displayName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)

  const conditions = [isNull(user.deletedAt)]

  if (search) {
    conditions.push(
      or(
        ilike(user.email, `%${search}%`),
        ilike(user.firstName, `%${search}%`),
        ilike(user.lastName, `%${search}%`),
        ilike(user.displayName, `%${search}%`)
      )
    )
  }

  query = query.where(and(...conditions))

  // Get total count
  const countQuery = db
    .select({ count: db.$count() })
    .from(user)
    .where(and(...conditions))

  const [{ count }] = await countQuery

  // Apply pagination and ordering
  const offset = (page - 1) * pageSize
  const data = await query
    .orderBy(sortDescending ? user[orderBy].desc() : user[orderBy].asc())
    .limit(pageSize)
    .offset(offset)

  return {
    data,
    count,
    page,
    pageSize,
    orderBy,
    search,
  }
}

export async function createUser(data: {
  user_id: string
  clerk_id: string
  email: string
  first_name?: string
  last_name?: string
  image_url?: string
  display_name?: string
  role: Role
}): Promise<{
  user_id: string
  email: string
  display_name: string
  role: string
}> {
  const [newUser] = await db
    .insert(user)
    .values({
      userId: data.user_id,
      clerkId: data.clerk_id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      imageUrl: data.image_url,
      displayName: data.display_name,
      role: data.role,
    })
    .returning({
      user_id: user.userId,
      email: user.email,
      display_name: user.displayName,
      role: user.role,
    })

  return newUser
}

export async function updateUser(userId: string, data: any) {
  const updateData: any = {}

  if (data.email) updateData.email = data.email
  if (data.first_name) updateData.firstName = data.first_name
  if (data.last_name) updateData.lastName = data.last_name
  if (data.image_url) updateData.imageUrl = data.image_url
  if (data.display_name) updateData.displayName = data.display_name
  if (data.role) updateData.role = data.role
  if (data.updated_at) updateData.updatedAt = data.updated_at

  const [updatedUser] = await db
    .update(user)
    .set(updateData)
    .where(eq(user.userId, userId))
    .returning({
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      displayName: user.displayName,
      role: user.role,
      createdAt: user.createdAt,
    })

  return updatedUser
}

export async function deleteUser(userId: string) {
  return db.transaction(async (tx) => {
    const cloudMode = process.env.CLOUD_MODE

    // Get websites owned by user
    const websites = await tx
      .select({ websiteId: website.websiteId })
      .from(website)
      .where(eq(website.userId, userId))

    const websiteIds = websites.map((w) => w.websiteId)

    // Get organizations owned by user
    const orgs = await tx
      .select({ orgId: org.orgId })
      .from(org)
      .innerJoin(orgUser, eq(org.orgId, orgUser.orgId))
      .where(and(eq(orgUser.userId, userId), eq(orgUser.role, ROLES.orgOwner)))

    const orgIds = orgs.map((o) => o.orgId)

    if (cloudMode) {
      // Soft delete in cloud mode
      const results = await Promise.all([
        tx
          .update(website)
          .set({ deletedAt: new Date() })
          .where(inArray(website.websiteId, websiteIds)),
        tx.update(user).set({ deletedAt: new Date() }).where(eq(user.userId, userId)),
      ])
      return results
    }

    // Hard delete in non-cloud mode
    const results = await Promise.all([
      tx.delete(eventData).where(inArray(eventData.websiteId, websiteIds)),
      tx.delete(sessionData).where(inArray(sessionData.websiteId, websiteIds)),
      tx.delete(websiteEvent).where(inArray(websiteEvent.websiteId, websiteIds)),
      tx.delete(session).where(inArray(session.websiteId, websiteIds)),
      tx.delete(orgUser).where(or(inArray(orgUser.orgId, orgIds), eq(orgUser.userId, userId))),
      tx.delete(org).where(inArray(org.orgId, orgIds)),
      tx.delete(report).where(or(inArray(report.websiteId, websiteIds), eq(report.userId, userId))),
      tx.delete(website).where(inArray(website.websiteId, websiteIds)),
      tx.delete(user).where(eq(user.userId, userId)),
    ])

    return results
  })
}
