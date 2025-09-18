import { eq, and, or, ilike, isNull, inArray, sql, desc, asc } from 'drizzle-orm'
import { db, org, orgUser, user, website } from '@/lib/db'
import { ROLES } from '@/lib/constants'
import { uuid } from '@/lib/crypto'
import { PageResult, QueryFilters } from '@/lib/types'

export async function findOrg(orgId: string, options: { includeMembers?: boolean } = {}) {
  const { includeMembers } = options

  if (includeMembers) {
    return db
      .select({
        org,
        members: {
          orgUserId: orgUser.orgUserId,
          orgId: orgUser.orgId,
          userId: orgUser.userId,
          role: orgUser.role,
          createdAt: orgUser.createdAt,
          updatedAt: orgUser.updatedAt,
          user: {
            userId: user.userId,
            displayName: user.displayName,
            email: user.email,
          },
        },
      })
      .from(org)
      .leftJoin(orgUser, eq(org.orgId, orgUser.orgId))
      .leftJoin(user, eq(orgUser.userId, user.userId))
      .where(eq(org.orgId, orgId))
  }

  return db
    .select()
    .from(org)
    .where(eq(org.orgId, orgId))
    .limit(1)
    .then((rows) => rows[0] || null)
}

export async function getOrg(orgId: string, options: { includeMembers?: boolean } = {}) {
  return findOrg(orgId, options)
}

export async function findOrgByAccessCode(accessCode: string) {
  return db
    .select()
    .from(org)
    .where(eq(org.accessCode, accessCode))
    .limit(1)
    .then((rows) => rows[0] || null)
}

export async function getOrgs(
  whereClause: any = {},
  filters: QueryFilters = {}
): Promise<PageResult<any[]>> {
  const { search, page = 1, pageSize = 20, orderBy = 'createdAt', sortDescending = true } = filters

  let query = db.select().from(org)

  const conditions = []

  if (search) {
    conditions.push(ilike(org.name, `%${search}%`))
  }

  if (whereClause) {
    conditions.push(whereClause)
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions))
  }

  // Get total count
  const countQuery = db.select({ count: sql<number>`count(*)` }).from(org)

  if (conditions.length > 0) {
    countQuery.where(and(...conditions))
  }

  const [{ count }] = await countQuery

  // Apply pagination and ordering
  const offset = (page - 1) * pageSize
  const data = await query
    .orderBy(sortDescending ? desc(org[orderBy]) : asc(org[orderBy]))
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

export async function getUserOrgs(
  userId: string,
  filters: QueryFilters = {}
): Promise<PageResult<any[]>> {
  const { search, page = 1, pageSize = 20, orderBy = 'createdAt', sortDescending = true } = filters

  let query = db
    .select({
      org,
      memberCount: sql<number>`count(DISTINCT ${orgUser.userId})`,
      websiteCount: sql<number>`count(DISTINCT ${website.websiteId})`,
      members: {
        orgUserId: orgUser.orgUserId,
        orgId: orgUser.orgId,
        userId: orgUser.userId,
        role: orgUser.role,
        user: {
          userId: user.userId,
          displayName: user.displayName,
          email: user.email,
        },
      },
    })
    .from(org)
    .innerJoin(orgUser, eq(org.orgId, orgUser.orgId))
    .leftJoin(user, eq(orgUser.userId, user.userId))
    .leftJoin(website, and(eq(org.orgId, website.orgId), isNull(website.deletedAt)))

  const conditions = [isNull(org.deletedAt), eq(orgUser.userId, userId), isNull(user.deletedAt)]

  if (search) {
    conditions.push(ilike(org.name, `%${search}%`))
  }

  query = query.where(and(...conditions)).groupBy(org.orgId, orgUser.orgUserId, user.userId)

  // Get total count
  const countQuery = db
    .select({ count: sql<number>`count(DISTINCT ${org.orgId})` })
    .from(org)
    .innerJoin(orgUser, eq(org.orgId, orgUser.orgId))
    .leftJoin(user, eq(orgUser.userId, user.userId))
    .where(and(...conditions))

  const [{ count }] = await countQuery

  // Apply pagination and ordering
  const offset = (page - 1) * pageSize
  const data = await query
    .orderBy(sortDescending ? desc(org[orderBy]) : asc(org[orderBy]))
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

export async function createOrg(data: any, userId: string) {
  const orgValues: any = {
    orgId: data.id,
    name: data.name,
    accessCode: data.access_code,
  }

  if (data.logo_url) {
    orgValues.logoUrl = data.logo_url
  }

  const [newOrg] = await db
    .insert(org)
    .values(orgValues)
    .returning()

  const [newOrgUser] = await db
    .insert(orgUser)
    .values({
      orgUserId: uuid(),
      orgId: data.id,
      userId: userId,
      role: ROLES.orgOwner,
    })
    .returning()

  return [newOrg, newOrgUser]
}

export async function updateOrg(orgId: string, data: any) {
  const updateData: any = {
    updatedAt: new Date(),
  }

  if (data.name) updateData.name = data.name
  if (data.access_code) updateData.accessCode = data.access_code
  if (data.logo_url) updateData.logoUrl = data.logo_url

  const [updatedOrg] = await db.update(org).set(updateData).where(eq(org.orgId, orgId)).returning()

  return updatedOrg
}

export async function deleteOrg(orgId: string) {
  const cloudMode = !!process.env.CLOUD_MODE

  if (cloudMode) {
    // Soft delete in cloud mode
    const [deletedOrg] = await db
      .update(org)
      .set({ deletedAt: new Date() })
      .where(eq(org.orgId, orgId))
      .returning()

    return [deletedOrg]
  }

  // Hard delete in non-cloud mode
  const deletedOrgUsers = await db.delete(orgUser).where(eq(orgUser.orgId, orgId))

  const [deletedOrg] = await db.delete(org).where(eq(org.orgId, orgId)).returning()

  return [deletedOrgUsers, deletedOrg]
}
