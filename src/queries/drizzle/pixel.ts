import { eq, and, or, ilike, sql, desc, asc } from 'drizzle-orm'
import { db, pixel } from '@/lib/db'
import { PageResult, QueryFilters } from '@/lib/types'

export async function findPixel(pixelId: string) {
  return db
    .select()
    .from(pixel)
    .where(eq(pixel.pixelId, pixelId))
    .limit(1)
    .then((rows) => rows[0] || null)
}

export async function getPixel(pixelId: string) {
  return findPixel(pixelId)
}

export async function findPixelBySlug(slug: string) {
  return db
    .select()
    .from(pixel)
    .where(eq(pixel.slug, slug))
    .limit(1)
    .then((rows) => rows[0] || null)
}

export async function getPixels(
  whereClause: any = {},
  filters: QueryFilters = {}
): Promise<PageResult<any[]>> {
  const { search, page = 1, pageSize = 20, orderBy = 'createdAt', sortDescending = true } = filters

  let query = db.select().from(pixel)

  const conditions = []

  if (search) {
    conditions.push(or(ilike(pixel.name, `%${search}%`), ilike(pixel.slug, `%${search}%`)))
  }

  if (whereClause) {
    conditions.push(whereClause)
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions))
  }

  // Get total count
  const countQuery = db.select({ count: sql<number>`count(*)` }).from(pixel)

  if (conditions.length > 0) {
    countQuery.where(and(...conditions))
  }

  const [{ count }] = await countQuery

  // Apply pagination and ordering
  const offset = (page - 1) * pageSize
  const data = await query
    .orderBy(sortDescending ? desc(pixel[orderBy]) : asc(pixel[orderBy]))
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

export async function getUserPixels(
  userId: string,
  filters?: QueryFilters
): Promise<PageResult<any[]>> {
  return getPixels(eq(pixel.userId, userId), filters)
}

export async function getOrgPixels(
  orgId: string,
  filters?: QueryFilters
): Promise<PageResult<any[]>> {
  return getPixels(eq(pixel.orgId, orgId), filters)
}

export async function createPixel(data: any) {
  const [newPixel] = await db
    .insert(pixel)
    .values({
      pixelId: data.id,
      name: data.name,
      slug: data.slug,
      userId: data.user_id,
      orgId: data.org_id,
    })
    .returning()

  return newPixel
}

export async function updatePixel(pixelId: string, data: any) {
  const updateData: any = {
    updatedAt: new Date(),
  }

  if (data.name) updateData.name = data.name
  if (data.slug) updateData.slug = data.slug
  if (data.user_id) updateData.userId = data.user_id
  if (data.org_id) updateData.orgId = data.org_id

  const [updatedPixel] = await db
    .update(pixel)
    .set(updateData)
    .where(eq(pixel.pixelId, pixelId))
    .returning()

  return updatedPixel
}

export async function deletePixel(pixelId: string) {
  const [deletedPixel] = await db.delete(pixel).where(eq(pixel.pixelId, pixelId)).returning()

  return deletedPixel
}
