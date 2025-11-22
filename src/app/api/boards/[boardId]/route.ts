import { z } from 'zod'
import { canUpdateBoard, canDeleteBoard, canViewBoard } from '@/validations'
import { parseRequest } from '@/lib/request'
import { ok, json, unauthorized, serverError, badRequest } from '@/lib/response'
import { deleteBoard, getBoard, updateBoard } from '@/queries/drizzle'
import { isValidUuid } from '@/lib/uuid'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { auth, error } = await parseRequest(request)

  if (error) {
    return error()
  }

  const { boardId } = await params

  if (!isValidUuid(boardId)) {
    return badRequest('Invalid board ID format')
  }

  if (!(await canViewBoard(auth, boardId))) {
    return unauthorized()
  }

  const board = await getBoard(boardId)

  return json(board)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const schema = z.object({
    name: z.string().max(100).optional(),
    description: z.string().max(500).nullable().optional(),
    config: z.any().nullable().optional(),
  })

  const { auth, body, error } = await parseRequest(request, schema)

  if (error) {
    return error()
  }

  const { boardId } = await params
  const { name, description, config } = body

  if (!isValidUuid(boardId)) {
    return badRequest('Invalid board ID format')
  }

  if (!(await canUpdateBoard(auth, boardId))) {
    return unauthorized()
  }

  try {
    const result = await updateBoard(boardId, { name, description, config })

    return Response.json(result)
  } catch (e: any) {
    return serverError(e)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { auth, error } = await parseRequest(request)

  if (error) {
    return error()
  }

  const { boardId } = await params

  if (!isValidUuid(boardId)) {
    return badRequest('Invalid board ID format')
  }

  if (!(await canDeleteBoard(auth, boardId))) {
    return unauthorized()
  }

  await deleteBoard(boardId)

  return ok()
}
