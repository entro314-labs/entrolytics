import { and, asc, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm';
import { db, link } from '@/lib/db';
import type { PageResult, QueryFilters } from '@/lib/types';

export async function findLink(linkId: string) {
  return db
    .select()
    .from(link)
    .where(eq(link.linkId, linkId))
    .limit(1)
    .then(rows => rows[0] || null);
}

export async function getLink(linkId: string) {
  return findLink(linkId);
}

export async function findLinkBySlug(slug: string) {
  return db
    .select()
    .from(link)
    .where(eq(link.slug, slug))
    .limit(1)
    .then(rows => rows[0] || null);
}

export async function getLinks(
  whereClause: any = {},
  filters: QueryFilters = {},
): Promise<PageResult<any[]>> {
  const { search, page = 1, pageSize = 20, orderBy = 'createdAt', sortDescending = true } = filters;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(link.name, `%${search}%`),
        ilike(link.url, `%${search}%`),
        ilike(link.slug, `%${search}%`),
      ),
    );
  }

  if (whereClause) {
    conditions.push(whereClause);
  }

  // Build query with conditional where clause
  const query =
    conditions.length > 0
      ? db
          .select()
          .from(link)
          .where(and(...conditions))
      : db.select().from(link);

  // Get total count with conditional where clause
  const countQuery =
    conditions.length > 0
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(link)
          .where(and(...conditions))
      : db.select({ count: sql<number>`count(*)` }).from(link);

  const [{ count }] = await countQuery;

  // Apply pagination and ordering
  const offset = (page - 1) * pageSize;
  const data = await query
    .orderBy(sortDescending ? desc(link[orderBy]) : asc(link[orderBy]))
    .limit(pageSize)
    .offset(offset);

  return {
    data,
    count,
    page,
    pageSize,
    orderBy,
    search,
  };
}

export async function getUserLinks(
  userId: string,
  filters?: QueryFilters,
): Promise<PageResult<any[]>> {
  return getLinks(and(eq(link.userId, userId), isNull(link.deletedAt)), filters);
}

export async function getOrgLinks(
  orgId: string,
  filters?: QueryFilters,
): Promise<PageResult<any[]>> {
  return getLinks(eq(link.orgId, orgId), filters);
}

export async function createLink(data: any) {
  const [newLink] = await db
    .insert(link)
    .values({
      linkId: data.id,
      name: data.name,
      url: data.url,
      slug: data.slug,
      userId: data.user_id,
      orgId: data.org_id,
    })
    .returning();

  return newLink;
}

export async function updateLink(linkId: string, data: any) {
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (data.name) updateData.name = data.name;
  if (data.url) updateData.url = data.url;
  if (data.slug) updateData.slug = data.slug;
  if (data.user_id) updateData.userId = data.user_id;
  if (data.org_id) updateData.orgId = data.org_id;

  const [updatedLink] = await db
    .update(link)
    .set(updateData)
    .where(eq(link.linkId, linkId))
    .returning();

  return updatedLink;
}

export async function deleteLink(linkId: string) {
  const [deletedLink] = await db.delete(link).where(eq(link.linkId, linkId)).returning();

  return deletedLink;
}
