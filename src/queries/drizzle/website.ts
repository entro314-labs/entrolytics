import { eq, and, or, ilike, isNull, inArray } from 'drizzle-orm'
import {
  db,
  website,
  user,
  org,
  orgUser,
  eventData,
  sessionData,
  websiteEvent,
  session,
  report,
} from '@/lib/db'
import { PageResult, QueryFilters } from '@/lib/types'
import { ROLES } from '@/lib/constants'
import redis from '@/lib/redis'

export async function findWebsite(websiteId: string) {
  return db
    .select()
    .from(website)
    .where(eq(website.websiteId, websiteId))
    .limit(1)
    .then((rows) => rows[0] || null)
}

export async function getWebsite(websiteId: string) {
  return findWebsite(websiteId)
}

export async function getSharedWebsite(shareId: string) {
  return db
    .select()
    .from(website)
    .where(and(eq(website.shareId, shareId), isNull(website.deletedAt)))
    .limit(1)
    .then((rows) => rows[0] || null)
}

export async function getWebsites(
  whereClause: any = {},
  filters: QueryFilters = {}
): Promise<PageResult<any[]>> {
  const { search, page = 1, pageSize = 20, orderBy = 'createdAt', sortDescending = true } = filters

  let query = db.select().from(website)

  const conditions = [isNull(website.deletedAt)]

  if (search) {
    conditions.push(or(ilike(website.name, `%${search}%`), ilike(website.domain, `%${search}%`)))
  }

  if (whereClause) {
    conditions.push(whereClause)
  }

  query = query.where(and(...conditions))

  // Get total count
  const countQuery = db
    .select({ count: db.$count() })
    .from(website)
    .where(and(...conditions))

  const [{ count }] = await countQuery

  // Apply pagination and ordering
  const offset = (page - 1) * pageSize
  const data = await query
    .orderBy(sortDescending ? website[orderBy].desc() : website[orderBy].asc())
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

export async function getAllWebsites(userId: string) {
  return db
    .select()
    .from(website)
    .leftJoin(org, eq(website.orgId, org.orgId))
    .leftJoin(orgUser, eq(org.orgId, orgUser.orgId))
    .where(
      and(
        or(eq(website.userId, userId), and(eq(orgUser.userId, userId), isNull(org.deletedAt))),
        isNull(website.deletedAt)
      )
    )
}

export async function getAllUserWebsitesIncludingOrgOwner(userId: string) {
  return db
    .select()
    .from(website)
    .leftJoin(org, eq(website.orgId, org.orgId))
    .leftJoin(orgUser, eq(org.orgId, orgUser.orgId))
    .where(
      or(
        eq(website.userId, userId),
        and(eq(orgUser.userId, userId), eq(orgUser.role, ROLES.orgOwner), isNull(org.deletedAt))
      )
    )
}

export async function getUserWebsites(
  userId: string,
  filters?: QueryFilters
): Promise<PageResult<any[]>> {
  let query = db
    .select({
      website,
      user: {
        displayName: user.displayName,
        email: user.email,
        userId: user.userId,
      },
    })
    .from(website)
    .leftJoin(user, eq(website.userId, user.userId))
    .where(eq(website.userId, userId))

  return getWebsites(eq(website.userId, userId), {
    orderBy: 'name',
    ...filters,
  })
}

export async function getOrgWebsites(
  orgId: string,
  filters?: QueryFilters
): Promise<PageResult<any[]>> {
  return getWebsites(eq(website.orgId, orgId), filters)
}

export async function createWebsite(data: any) {
  const [newWebsite] = await db
    .insert(website)
    .values({
      websiteId: data.website_id,
      name: data.name,
      domain: data.domain,
      shareId: data.share_id,
      resetAt: data.reset_at,
      userId: data.user_id,
      createdBy: data.created_by,
      orgId: data.org_id,
    })
    .returning()

  return newWebsite
}

export async function updateWebsite(websiteId: string, data: any) {
  const updateData: any = {}

  if (data.name) updateData.name = data.name
  if (data.domain) updateData.domain = data.domain
  if (data.share_id) updateData.shareId = data.share_id
  if (data.reset_at) updateData.resetAt = data.reset_at
  if (data.user_id) updateData.userId = data.user_id
  if (data.org_id) updateData.orgId = data.org_id
  if (data.updated_at) updateData.updatedAt = data.updated_at

  const [updatedWebsite] = await db
    .update(website)
    .set(updateData)
    .where(eq(website.websiteId, websiteId))
    .returning()

  return updatedWebsite
}

export async function resetWebsite(websiteId: string) {
  return db.transaction(async (tx) => {
    const cloudMode = !!process.env.CLOUD_MODE

    // Delete all related data
    await Promise.all([
      tx.delete(eventData).where(eq(eventData.websiteId, websiteId)),
      tx.delete(sessionData).where(eq(sessionData.websiteId, websiteId)),
      tx.delete(websiteEvent).where(eq(websiteEvent.websiteId, websiteId)),
      tx.delete(session).where(eq(session.websiteId, websiteId)),
    ])

    // Update reset timestamp
    const [updatedWebsite] = await tx
      .update(website)
      .set({ resetAt: new Date() })
      .where(eq(website.websiteId, websiteId))
      .returning()

    if (cloudMode) {
      await redis.client.set(`website:${websiteId}`, JSON.stringify(updatedWebsite))
    }

    return updatedWebsite
  })
}

export async function deleteWebsite(websiteId: string) {
  return db.transaction(async (tx) => {
    const cloudMode = !!process.env.CLOUD_MODE

    // Delete all related data
    await Promise.all([
      tx.delete(eventData).where(eq(eventData.websiteId, websiteId)),
      tx.delete(sessionData).where(eq(sessionData.websiteId, websiteId)),
      tx.delete(websiteEvent).where(eq(websiteEvent.websiteId, websiteId)),
      tx.delete(session).where(eq(session.websiteId, websiteId)),
      tx.delete(report).where(eq(report.websiteId, websiteId)),
    ])

    let deletedWebsite
    if (cloudMode) {
      // Soft delete in cloud mode
      ;[deletedWebsite] = await tx
        .update(website)
        .set({ deletedAt: new Date() })
        .where(eq(website.websiteId, websiteId))
        .returning()

      await redis.client.del(`website:${websiteId}`)
    } else {
      // Hard delete in non-cloud mode
      ;[deletedWebsite] = await tx
        .delete(website)
        .where(eq(website.websiteId, websiteId))
        .returning()
    }

    return deletedWebsite
  })
}
