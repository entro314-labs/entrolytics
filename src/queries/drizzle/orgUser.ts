import { eq, and, or, ilike, sql, desc, asc } from 'drizzle-orm'
import { db, orgUser, user } from '@/lib/db'
import { uuid } from '@/lib/crypto'
import { PageResult, QueryFilters } from '@/lib/types'

export async function findOrgUser(orgUserId: string) {
  return db
    .select()
    .from(orgUser)
    .where(eq(orgUser.orgUserId, orgUserId))
    .limit(1)
    .then((rows) => rows[0] || null)
}

export async function getOrgUser(orgId: string, userId: string) {
  return db
    .select()
    .from(orgUser)
    .where(and(eq(orgUser.orgId, orgId), eq(orgUser.userId, userId)))
    .limit(1)
    .then((rows) => rows[0] || null)
}

export async function getOrgUsers(
  whereClause: any = null,
  filters: QueryFilters = {}
): Promise<PageResult<any[]>> {
  const { search, page = 1, pageSize = 20, orderBy = 'createdAt', sortDescending = true } = filters

  const conditions = []

  if (search) {
    conditions.push(or(ilike(user.displayName, `%${search}%`), ilike(user.email, `%${search}%`)))
  }

  if (whereClause) {
    conditions.push(whereClause)
  }

  // Build query with conditional where clause
  const query =
    conditions.length > 0
      ? db
          .select({
            orgUserId: orgUser.orgUserId,
            orgId: orgUser.orgId,
            userId: orgUser.userId,
            role: orgUser.role,
            createdAt: orgUser.createdAt,
            updatedAt: orgUser.updatedAt,
            userDisplayName: user.displayName,
            userEmail: user.email,
            userFirstName: user.firstName,
            userLastName: user.lastName,
            userImageUrl: user.imageUrl,
          })
          .from(orgUser)
          .leftJoin(user, eq(orgUser.userId, user.userId))
          .where(and(...conditions))
      : db
          .select({
            orgUserId: orgUser.orgUserId,
            orgId: orgUser.orgId,
            userId: orgUser.userId,
            role: orgUser.role,
            createdAt: orgUser.createdAt,
            updatedAt: orgUser.updatedAt,
            userDisplayName: user.displayName,
            userEmail: user.email,
            userFirstName: user.firstName,
            userLastName: user.lastName,
            userImageUrl: user.imageUrl,
          })
          .from(orgUser)
          .leftJoin(user, eq(orgUser.userId, user.userId))

  // Get total count with conditional where clause
  const countQuery =
    conditions.length > 0
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(orgUser)
          .leftJoin(user, eq(orgUser.userId, user.userId))
          .where(and(...conditions))
      : db
          .select({ count: sql<number>`count(*)` })
          .from(orgUser)
          .leftJoin(user, eq(orgUser.userId, user.userId))

  const [{ count }] = await countQuery

  // Apply pagination and ordering
  const offset = (page - 1) * pageSize
  const data = await query
    .orderBy(sortDescending ? desc(orgUser[orderBy]) : asc(orgUser[orderBy]))
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

export async function createOrgUser(userId: string, orgId: string, role: string) {
  const [newOrgUser] = await db
    .insert(orgUser)
    .values({
      orgUserId: uuid(),
      userId: userId,
      orgId: orgId,
      role: role,
    })
    .returning()

  return newOrgUser
}

export async function updateOrgUser(orgUserId: string, data: any) {
  const updateData: any = {
    updatedAt: new Date(),
  }

  if (data.role) updateData.role = data.role

  const [updatedOrgUser] = await db
    .update(orgUser)
    .set(updateData)
    .where(eq(orgUser.orgUserId, orgUserId))
    .returning()

  return updatedOrgUser
}

export async function deleteOrgUser(orgId: string, userId: string) {
  return db.delete(orgUser).where(and(eq(orgUser.orgId, orgId), eq(orgUser.userId, userId)))
}
