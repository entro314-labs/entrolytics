import { and, asc, desc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm';
import { ROLES } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { db, org, orgUser, user, website } from '@/lib/db';
import type { PageResult, QueryFilters } from '@/lib/types';

export async function findOrg(orgId: string, options: { includeMembers?: boolean } = {}) {
  const { includeMembers } = options;

  if (includeMembers) {
    const rows = await db
      .select({
        // Flatten org fields
        orgId: org.orgId,
        name: org.name,
        accessCode: org.accessCode,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        deletedAt: org.deletedAt,
        logoUrl: org.logoUrl,
        // Flatten member fields
        memberOrgUserId: orgUser.orgUserId,
        memberOrgId: orgUser.orgId,
        memberUserId: orgUser.userId,
        memberRole: orgUser.role,
        memberCreatedAt: orgUser.createdAt,
        memberUpdatedAt: orgUser.updatedAt,
        memberUserDisplayName: user.displayName,
        memberUserEmail: user.email,
      })
      .from(org)
      .leftJoin(orgUser, eq(org.orgId, orgUser.orgId))
      .leftJoin(user, eq(orgUser.userId, user.userId))
      .where(eq(org.orgId, orgId));

    if (!rows || rows.length === 0) {
      return null;
    }

    // Transform flattened rows into single org object with members array
    const firstRow = rows[0];
    const orgData = {
      id: firstRow.orgId,
      orgId: firstRow.orgId,
      name: firstRow.name,
      accessCode: firstRow.accessCode,
      createdAt: firstRow.createdAt,
      updatedAt: firstRow.updatedAt,
      deletedAt: firstRow.deletedAt,
      logoUrl: firstRow.logoUrl,
      members: rows
        .filter(row => row.memberUserId) // Only include rows with actual members
        .map(row => ({
          orgUserId: row.memberOrgUserId,
          userId: row.memberUserId,
          role: row.memberRole,
          createdAt: row.memberCreatedAt,
          updatedAt: row.memberUpdatedAt,
          user: {
            id: row.memberUserId,
            userId: row.memberUserId,
            displayName: row.memberUserDisplayName,
            email: row.memberUserEmail,
            username: row.memberUserDisplayName || row.memberUserEmail,
          },
        })),
    };

    return orgData;
  }

  return db
    .select()
    .from(org)
    .where(eq(org.orgId, orgId))
    .limit(1)
    .then(rows => rows[0] || null);
}

export async function getOrg(orgId: string, options: { includeMembers?: boolean } = {}) {
  return findOrg(orgId, options);
}

export async function findOrgByAccessCode(accessCode: string) {
  return db
    .select()
    .from(org)
    .where(eq(org.accessCode, accessCode))
    .limit(1)
    .then(rows => rows[0] || null);
}

export async function getOrgs(
  whereClause: any = {},
  filters: QueryFilters = {},
): Promise<PageResult<any[]>> {
  const { search, page = 1, pageSize = 20, orderBy = 'createdAt', sortDescending = true } = filters;

  const conditions = [];

  if (search) {
    conditions.push(ilike(org.name, `%${search}%`));
  }

  if (whereClause) {
    conditions.push(whereClause);
  }

  // Build query with conditional where clause
  const query =
    conditions.length > 0
      ? db
          .select()
          .from(org)
          .where(and(...conditions))
      : db.select().from(org);

  // Get total count with conditional where clause
  const countQuery =
    conditions.length > 0
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(org)
          .where(and(...conditions))
      : db.select({ count: sql<number>`count(*)` }).from(org);

  const [{ count }] = await countQuery;

  // Apply pagination and ordering
  const offset = (page - 1) * pageSize;
  const data = await query
    .orderBy(sortDescending ? desc(org[orderBy]) : asc(org[orderBy]))
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

export async function getUserOrgs(
  userId: string,
  filters: QueryFilters = {},
): Promise<PageResult<any[]>> {
  const { search, page = 1, pageSize = 20, orderBy = 'createdAt', sortDescending = true } = filters;

  const query = db
    .select({
      orgId: org.orgId,
      name: org.name,
      accessCode: org.accessCode,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      deletedAt: org.deletedAt,
      logoUrl: org.logoUrl,
      memberCount: sql<number>`count(DISTINCT ${orgUser.userId})`,
      websiteCount: sql<number>`count(DISTINCT ${website.websiteId})`,
      orgUserId: orgUser.orgUserId,
      orgUserRole: orgUser.role,
      userDisplayName: user.displayName,
      userEmail: user.email,
    })
    .from(org)
    .innerJoin(orgUser, eq(org.orgId, orgUser.orgId))
    .leftJoin(user, eq(orgUser.userId, user.userId))
    .leftJoin(website, and(eq(org.orgId, website.orgId), isNull(website.deletedAt)));

  const conditions = [isNull(org.deletedAt), eq(orgUser.userId, userId), isNull(user.deletedAt)];

  if (search) {
    conditions.push(ilike(org.name, `%${search}%`));
  }

  // Build the main query with conditions and grouping
  const mainQuery = query
    .where(and(...conditions))
    .groupBy(org.orgId, orgUser.orgUserId, user.userId);

  // Get total count with a separate query
  const countQuery = db
    .select({ count: sql<number>`count(DISTINCT ${org.orgId})` })
    .from(org)
    .innerJoin(orgUser, eq(org.orgId, orgUser.orgId))
    .leftJoin(user, eq(orgUser.userId, user.userId))
    .where(and(...conditions));

  const [{ count }] = await countQuery;

  // Apply pagination and ordering
  const offset = (page - 1) * pageSize;
  const data = await mainQuery
    .orderBy(sortDescending ? desc(org[orderBy]) : asc(org[orderBy]))
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

export async function createOrg(data: any, userId: string) {
  const orgValues: any = {
    orgId: data.id,
    name: data.name,
    accessCode: data.access_code,
  };

  if (data.logo_url) {
    orgValues.logoUrl = data.logo_url;
  }

  const [newOrg] = await db.insert(org).values(orgValues).returning();

  const [newOrgUser] = await db
    .insert(orgUser)
    .values({
      orgUserId: uuid(),
      orgId: data.id,
      userId: userId,
      role: ROLES.orgOwner,
    })
    .returning();

  return [newOrg, newOrgUser];
}

export async function updateOrg(orgId: string, data: any) {
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (data.name) updateData.name = data.name;
  if (data.access_code) updateData.accessCode = data.access_code;
  if (data.logo_url) updateData.logoUrl = data.logo_url;

  const [updatedOrg] = await db.update(org).set(updateData).where(eq(org.orgId, orgId)).returning();

  return updatedOrg;
}

export async function deleteOrg(orgId: string) {
  const edgeMode = !!process.env.EDGE_MODE;

  if (edgeMode) {
    // Soft delete in edge mode
    const [deletedOrg] = await db
      .update(org)
      .set({ deletedAt: new Date() })
      .where(eq(org.orgId, orgId))
      .returning();

    return [deletedOrg];
  }

  // Hard delete in non-cloud mode
  const deletedOrgUsers = await db.delete(orgUser).where(eq(orgUser.orgId, orgId));

  const [deletedOrg] = await db.delete(org).where(eq(org.orgId, orgId)).returning();

  return [deletedOrgUsers, deletedOrg];
}
