import { z } from 'zod'
import { canViewBoardWidget, canUpdateBoardWidget, canDeleteBoardWidget } from '@/validations'
import { parseRequest } from '@/lib/request'
import { ok, json, unauthorized, serverError, badRequest } from '@/lib/response'
import { getBoardWidget, updateBoardWidget, deleteBoardWidget } from '@/queries/drizzle'
import { isValidUuid } from '@/lib/uuid'

const WIDGET_TYPES = ['stats', 'chart', 'list', 'map', 'heatmap'] as const

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardId: string; widgetId: string }> }
) {
  const { auth, error } = await parseRequest(request)

  if (error) {
    return error()
  }

  const { widgetId } = await params

  if (!isValidUuid(widgetId)) {
    return badRequest('Invalid widget ID format')
  }

  if (!(await canViewBoardWidget(auth, widgetId))) {
    return unauthorized()
  }

  const widget = await getBoardWidget(widgetId)

  return json(widget)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boardId: string; widgetId: string }> }
) {
  const schema = z.object({
    websiteId: z.string().uuid().optional(),
    type: z.enum(WIDGET_TYPES).optional(),
    title: z.string().max(100).nullable().optional(),
    config: z.any().nullable().optional(),
    position: z.number().int().min(0).optional(),
  })

  const { auth, body, error } = await parseRequest(request, schema)

  if (error) {
    return error()
  }

  const { widgetId } = await params
  const { websiteId, type, title, config, position } = body

  if (!isValidUuid(widgetId)) {
    return badRequest('Invalid widget ID format')
  }

  if (!(await canUpdateBoardWidget(auth, widgetId))) {
    return unauthorized()
  }

  try {
    const result = await updateBoardWidget(widgetId, {
      websiteId,
      type,
      title,
      config,
      position,
    })

    return Response.json(result)
  } catch (e: any) {
    return serverError(e)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ boardId: string; widgetId: string }> }
) {
  const { auth, error } = await parseRequest(request)

  if (error) {
    return error()
  }

  const { widgetId } = await params

  if (!isValidUuid(widgetId)) {
    return badRequest('Invalid widget ID format')
  }

  if (!(await canDeleteBoardWidget(auth, widgetId))) {
    return unauthorized()
  }

  await deleteBoardWidget(widgetId)

  return ok()
}
