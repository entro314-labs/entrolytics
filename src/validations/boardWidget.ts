import { Auth } from '@/lib/types'
import { getBoardWidget } from '@/queries/drizzle'
import { canViewBoard, canUpdateBoard, canDeleteBoard } from './board'

export async function canViewBoardWidget(auth: Auth, widgetId: string) {
  const widget = await getBoardWidget(widgetId)

  if (!widget) {
    return false
  }

  return canViewBoard(auth, widget.boardId)
}

export async function canCreateBoardWidget(auth: Auth, boardId: string) {
  return canUpdateBoard(auth, boardId)
}

export async function canUpdateBoardWidget(auth: Auth, widgetId: string) {
  const widget = await getBoardWidget(widgetId)

  if (!widget) {
    return false
  }

  return canUpdateBoard(auth, widget.boardId)
}

export async function canDeleteBoardWidget(auth: Auth, widgetId: string) {
  const widget = await getBoardWidget(widgetId)

  if (!widget) {
    return false
  }

  return canDeleteBoard(auth, widget.boardId)
}
