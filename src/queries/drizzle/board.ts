import { and, asc, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm';
import { board, db } from '@/lib/db';
import type { PageResult, QueryFilters } from '@/lib/types';

export async function findBoard(boardId: string) {
  return db
    .select()
    .from(board)
    .where(eq(board.boardId, boardId))
    .limit(1)
    .then(rows => rows[0] || null);
}

export async function getBoard(boardId: string) {
  return findBoard(boardId);
}

export async function getBoards(
  whereClause: any = {},
  filters: QueryFilters = {},
): Promise<PageResult<any[]>> {
  const { search, page = 1, pageSize = 20, orderBy = 'createdAt', sortDescending = true } = filters;

  const conditions = [isNull(board.deletedAt)];

  if (search) {
    conditions.push(or(ilike(board.name, `%${search}%`), ilike(board.description, `%${search}%`)));
  }

  if (whereClause && Object.keys(whereClause).length > 0) {
    conditions.push(whereClause);
  }

  const query = db
    .select()
    .from(board)
    .where(and(...conditions));

  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(board)
    .where(and(...conditions));

  const [{ count }] = await countQuery;

  const offset = (page - 1) * pageSize;
  const data = await query
    .orderBy(sortDescending ? desc(board[orderBy]) : asc(board[orderBy]))
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

export async function getUserBoards(
  userId: string,
  filters?: QueryFilters,
): Promise<PageResult<any[]>> {
  return getBoards(eq(board.userId, userId), filters);
}

export async function getOrgBoards(
  orgId: string,
  filters?: QueryFilters,
): Promise<PageResult<any[]>> {
  return getBoards(eq(board.orgId, orgId), filters);
}

export async function createBoard(data: any) {
  const [newBoard] = await db
    .insert(board)
    .values({
      boardId: data.id,
      name: data.name,
      description: data.description,
      config: data.config,
      userId: data.user_id,
      orgId: data.org_id,
    })
    .returning();

  return newBoard;
}

export async function updateBoard(boardId: string, data: any) {
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (data.name) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.config !== undefined) updateData.config = data.config;
  if (data.user_id) updateData.userId = data.user_id;
  if (data.org_id) updateData.orgId = data.org_id;

  const [updatedBoard] = await db
    .update(board)
    .set(updateData)
    .where(eq(board.boardId, boardId))
    .returning();

  return updatedBoard;
}

export async function deleteBoard(boardId: string) {
  const edgeMode = !!process.env.EDGE_MODE;

  if (edgeMode) {
    const [deletedBoard] = await db
      .update(board)
      .set({ deletedAt: new Date() })
      .where(eq(board.boardId, boardId))
      .returning();

    return deletedBoard;
  }

  const [deletedBoard] = await db.delete(board).where(eq(board.boardId, boardId)).returning();

  return deletedBoard;
}
