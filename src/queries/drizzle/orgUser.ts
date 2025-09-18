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
  whereClause: any = {},
  filters: QueryFilters = {}
): Promise<PageResult<any[]>> {
  const { search, page = 1, pageSize = 20, orderBy = 'createdAt', sortDescending = true } = filters

  let query = db
    .select({
      orgUser,
      user: {
        userId: user.userId,
        displayName: user.displayName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
    })
    .from(orgUser)
    .leftJoin(user, eq(orgUser.userId, user.userId))

  const conditions = []

  if (search) {
    conditions.push(or(ilike(user.displayName, `%${search}%`), ilike(user.email, `%${search}%`)))
  }

  if (whereClause) {
    conditions.push(whereClause)
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions))
  }

  // Get total count
  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(orgUser)
    .leftJoin(user, eq(orgUser.userId, user.userId))

  if (conditions.length > 0) {
    countQuery.where(and(...conditions))
  }

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
