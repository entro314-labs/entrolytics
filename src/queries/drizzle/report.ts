import { eq, and, or, ilike, sql, desc, asc } from 'drizzle-orm'
import { db, report, user, website } from '@/lib/db'
import { PageResult, QueryFilters } from '@/lib/types'

export async function findReport(reportId: string) {
  return db
    .select()
    .from(report)
    .where(eq(report.reportId, reportId))
    .limit(1)
    .then((rows) => rows[0] || null)
}

export async function getReport(reportId: string) {
  return findReport(reportId)
}

export async function getReports(
  whereClause: any = {},
  filters: QueryFilters = {}
): Promise<PageResult<any[]>> {
  const { search, page = 1, pageSize = 20, orderBy = 'createdAt', sortDescending = true } = filters

  const conditions = []

  if (search) {
    conditions.push(
      or(
        ilike(report.name, `%${search}%`),
        ilike(report.description, `%${search}%`),
        ilike(report.type, `%${search}%`),
        ilike(user.displayName, `%${search}%`),
        ilike(user.email, `%${search}%`),
        ilike(website.name, `%${search}%`),
        ilike(website.domain, `%${search}%`)
      )
    )
  }

  if (whereClause) {
    conditions.push(whereClause)
  }

  // Build query with conditional where clause
  const query =
    conditions.length > 0
      ? db
          .select({
            // Flatten report fields
            reportId: report.reportId,
            userId: report.userId,
            websiteId: report.websiteId,
            type: report.type,
            name: report.name,
            description: report.description,
            parameters: report.parameters,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
            // Flatten user fields
            userDisplayName: user.displayName,
            userEmail: user.email,
            // Flatten website fields
            websiteName: website.name,
            websiteDomain: website.domain,
            websiteUserId: website.userId,
          })
          .from(report)
          .leftJoin(user, eq(report.userId, user.userId))
          .leftJoin(website, eq(report.websiteId, website.websiteId))
          .where(and(...conditions))
      : db
          .select({
            // Flatten report fields
            reportId: report.reportId,
            userId: report.userId,
            websiteId: report.websiteId,
            type: report.type,
            name: report.name,
            description: report.description,
            parameters: report.parameters,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
            // Flatten user fields
            userDisplayName: user.displayName,
            userEmail: user.email,
            // Flatten website fields
            websiteName: website.name,
            websiteDomain: website.domain,
            websiteUserId: website.userId,
          })
          .from(report)
          .leftJoin(user, eq(report.userId, user.userId))
          .leftJoin(website, eq(report.websiteId, website.websiteId))

  // Get total count with conditional where clause
  const countQuery =
    conditions.length > 0
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(report)
          .leftJoin(user, eq(report.userId, user.userId))
          .leftJoin(website, eq(report.websiteId, website.websiteId))
          .where(and(...conditions))
      : db
          .select({ count: sql<number>`count(*)` })
          .from(report)
          .leftJoin(user, eq(report.userId, user.userId))
          .leftJoin(website, eq(report.websiteId, website.websiteId))

  const [{ count }] = await countQuery

  // Apply pagination and ordering
  const offset = (page - 1) * pageSize
  const data = await query
    .orderBy(sortDescending ? desc(report[orderBy]) : asc(report[orderBy]))
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

export async function getUserReports(
  userId: string,
  filters?: QueryFilters
): Promise<PageResult<any[]>> {
  return getReports(eq(report.userId, userId), filters)
}

export async function getWebsiteReports(
  websiteId: string,
  filters: QueryFilters = {}
): Promise<PageResult<any[]>> {
  return getReports(eq(report.websiteId, websiteId), filters)
}

export async function createReport(data: any) {
  const [newReport] = await db
    .insert(report)
    .values({
      reportId: data.id,
      userId: data.userId,
      websiteId: data.websiteId,
      type: data.type,
      name: data.name,
      description: data.description,
      parameters: data.parameters,
    })
    .returning()

  return newReport
}

export async function updateReport(reportId: string, data: any) {
  const updateData: any = {
    updatedAt: new Date(),
  }

  if (data.type) updateData.type = data.type
  if (data.name) updateData.name = data.name
  if (data.description) updateData.description = data.description
  if (data.parameters) updateData.parameters = data.parameters

  const [updatedReport] = await db
    .update(report)
    .set(updateData)
    .where(eq(report.reportId, reportId))
    .returning()

  return updatedReport
}

export async function deleteReport(reportId: string) {
  const [deletedReport] = await db.delete(report).where(eq(report.reportId, reportId)).returning()

  return deletedReport
}
