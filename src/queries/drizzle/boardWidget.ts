import { eq, and, asc } from 'drizzle-orm'
import { db, boardWidget } from '@/lib/db'

export async function findBoardWidget(widgetId: string) {
  return db
    .select()
    .from(boardWidget)
    .where(eq(boardWidget.widgetId, widgetId))
    .limit(1)
    .then((rows) => rows[0] || null)
}

export async function getBoardWidget(widgetId: string) {
  return findBoardWidget(widgetId)
}

export async function getBoardWidgets(boardId: string) {
  return db
    .select()
    .from(boardWidget)
    .where(eq(boardWidget.boardId, boardId))
    .orderBy(asc(boardWidget.position))
}

export async function createBoardWidget(data: {
  boardId: string
  websiteId: string
  type: string
  title?: string
  config?: any
  position?: number
}) {
  const [newWidget] = await db
    .insert(boardWidget)
    .values({
      boardId: data.boardId,
      websiteId: data.websiteId,
      type: data.type,
      title: data.title,
      config: data.config,
      position: data.position ?? 0,
    })
    .returning()

  return newWidget
}

export async function updateBoardWidget(widgetId: string, data: any) {
  const updateData: any = {
    updatedAt: new Date(),
  }

  if (data.title !== undefined) updateData.title = data.title
  if (data.config !== undefined) updateData.config = data.config
  if (data.position !== undefined) updateData.position = data.position
  if (data.websiteId) updateData.websiteId = data.websiteId
  if (data.type) updateData.type = data.type

  const [updatedWidget] = await db
    .update(boardWidget)
    .set(updateData)
    .where(eq(boardWidget.widgetId, widgetId))
    .returning()

  return updatedWidget
}

export async function deleteBoardWidget(widgetId: string) {
  const [deletedWidget] = await db
    .delete(boardWidget)
    .where(eq(boardWidget.widgetId, widgetId))
    .returning()

  return deletedWidget
}

export async function deleteBoardWidgets(boardId: string) {
  return db.delete(boardWidget).where(eq(boardWidget.boardId, boardId)).returning()
}

export async function getMaxWidgetPosition(boardId: string): Promise<number> {
  const widgets = await db
    .select({ position: boardWidget.position })
    .from(boardWidget)
    .where(eq(boardWidget.boardId, boardId))
    .orderBy(asc(boardWidget.position))

  if (widgets.length === 0) return 0
  return Math.max(...widgets.map((w) => w.position ?? 0)) + 1
}
