import { eq, and, or, ilike, isNull, inArray, desc, asc, sql } from 'drizzle-orm'
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
      clerkId: user.clerkId,
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
      clerkId: user.clerkId,
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

  // Build query with LEFT JOIN to count websites per user
  const query = db
    .select({
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      displayName: user.displayName,
      role: user.role,
      clerkId: user.clerkId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      websiteCount: sql<number>`cast(count(${website.websiteId}) as integer)`,
    })
    .from(user)
    .leftJoin(website, and(eq(user.userId, website.userId), isNull(website.deletedAt)))
    .where(and(...conditions))
    .groupBy(
      user.userId,
      user.email,
      user.firstName,
      user.lastName,
      user.imageUrl,
      user.displayName,
      user.role,
      user.clerkId,
      user.createdAt,
      user.updatedAt
    )

  // Get total count
  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(user)
    .where(and(...conditions))

  const [{ count }] = await countQuery

  // Apply pagination and ordering
  const offset = (page - 1) * pageSize
  const results = await query
    .orderBy(sortDescending ? desc(user[orderBy]) : asc(user[orderBy]))
    .limit(pageSize)
    .offset(offset)

  // Convert websiteCount to number since PostgreSQL returns it as string
  const data = results.map((row) => ({
    ...row,
    websiteCount: Number(row.websiteCount) || 0,
  }))

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
  userId: string
  email: string
  displayName: string
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
      userId: user.userId,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    })

  return newUser
}

export interface UserUpdatePayload {
  email?: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  displayName?: string
  role?: Role
  updatedAt?: Date
  deletedAt?: Date
}

export async function updateUser(userId: string, data: UserUpdatePayload) {
  const [updatedUser] = await db.update(user).set(data).where(eq(user.userId, userId)).returning({
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
  const edgeMode = process.env.EDGE_MODE

  // Get websites owned by user
  const websites = await db
    .select({ websiteId: website.websiteId })
    .from(website)
    .where(eq(website.userId, userId))

  const websiteIds = websites.map((w) => w.websiteId)

  // Get organizations owned by user
  const orgs = await db
    .select({ orgId: org.orgId })
    .from(org)
    .innerJoin(orgUser, eq(org.orgId, orgUser.orgId))
    .where(and(eq(orgUser.userId, userId), eq(orgUser.role, ROLES.orgOwner)))

  const orgIds = orgs.map((o) => o.orgId)

  if (edgeMode) {
    // Soft delete in edge mode
    const results = await Promise.all([
      db
        .update(website)
        .set({ deletedAt: new Date() })
        .where(inArray(website.websiteId, websiteIds)),
      db.update(user).set({ deletedAt: new Date() }).where(eq(user.userId, userId)),
    ])
    return results
  }

  // Hard delete in non-edge mode
  return db.transaction(async (tx) => {
    await tx.delete(eventData).where(inArray(eventData.websiteId, websiteIds))
    await tx.delete(sessionData).where(inArray(sessionData.websiteId, websiteIds))
    await tx.delete(websiteEvent).where(inArray(websiteEvent.websiteId, websiteIds))
    await tx.delete(session).where(inArray(session.websiteId, websiteIds))
    await tx.delete(orgUser).where(or(inArray(orgUser.orgId, orgIds), eq(orgUser.userId, userId)))
    await tx.delete(org).where(inArray(org.orgId, orgIds))
    await tx
      .delete(report)
      .where(or(inArray(report.websiteId, websiteIds), eq(report.userId, userId)))
    await tx.delete(website).where(inArray(website.websiteId, websiteIds))
    return tx.delete(user).where(eq(user.userId, userId))
  })
}
