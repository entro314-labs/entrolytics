import { eq, and, ilike, sql, desc, asc } from "drizzle-orm";
import { db, segment } from "@/lib/db";
import { PageResult, QueryFilters } from "@/lib/types";

export async function findSegment(segmentId: string) {
	return db
		.select()
		.from(segment)
		.where(eq(segment.segmentId, segmentId))
		.limit(1)
		.then((rows) => rows[0] || null);
}

export async function getSegment(segmentId: string) {
	return findSegment(segmentId);
}

export async function getSegments(
	whereClause: any = {},
	filters: QueryFilters = {},
): Promise<PageResult<any[]>> {
	const {
		search,
		page = 1,
		pageSize = 20,
		orderBy = "createdAt",
		sortDescending = true,
	} = filters;

	const conditions = [];

	if (search) {
		conditions.push(ilike(segment.name, `%${search}%`));
	}

	if (whereClause) {
		conditions.push(whereClause);
	}

	// Build query with conditional where clause
	const query =
		conditions.length > 0
			? db
					.select()
					.from(segment)
					.where(and(...conditions))
			: db.select().from(segment);

	// Get total count with conditional where clause
	const countQuery =
		conditions.length > 0
			? db
					.select({ count: sql<number>`count(*)` })
					.from(segment)
					.where(and(...conditions))
			: db.select({ count: sql<number>`count(*)` }).from(segment);

	const [{ count }] = await countQuery;

	// Apply pagination and ordering
	const offset = (page - 1) * pageSize;
	const data = await query
		.orderBy(sortDescending ? desc(segment[orderBy]) : asc(segment[orderBy]))
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

export async function getWebsiteSegment(websiteId: string, segmentId: string) {
	return db
		.select()
		.from(segment)
		.where(
			and(eq(segment.segmentId, segmentId), eq(segment.websiteId, websiteId)),
		)
		.limit(1)
		.then((rows) => rows[0] || null);
}

export async function getWebsiteSegments(
	websiteId: string,
	type: string,
	filters?: QueryFilters,
): Promise<PageResult<any[]>> {
	return getSegments(
		and(eq(segment.websiteId, websiteId), eq(segment.type, type)),
		filters,
	);
}

export async function createSegment(data: any) {
	const [newSegment] = await db
		.insert(segment)
		.values({
			segmentId: data.id,
			websiteId: data.website_id,
			type: data.type,
			name: data.name,
			parameters: data.parameters,
		})
		.returning();

	return newSegment;
}

export async function updateSegment(segmentId: string, data: any) {
	const updateData: any = {
		updatedAt: new Date(),
	};

	if (data.type) updateData.type = data.type;
	if (data.name) updateData.name = data.name;
	if (data.parameters) updateData.parameters = data.parameters;

	const [updatedSegment] = await db
		.update(segment)
		.set(updateData)
		.where(eq(segment.segmentId, segmentId))
		.returning();

	return updatedSegment;
}

export async function deleteSegment(segmentId: string) {
	const [deletedSegment] = await db
		.delete(segment)
		.where(eq(segment.segmentId, segmentId))
		.returning();

	return deletedSegment;
}
