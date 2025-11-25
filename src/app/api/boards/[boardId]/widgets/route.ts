import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { badRequest, json, serverError, unauthorized } from '@/lib/response';
import { isValidUuid } from '@/lib/uuid';
import { createBoardWidget, getBoardWidgets, getMaxWidgetPosition } from '@/queries/drizzle';
import { canCreateBoardWidget, canViewBoard } from '@/validations';

const WIDGET_TYPES = ['stats', 'chart', 'list', 'map', 'heatmap'] as const;

export async function GET(request: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { boardId } = await params;

  if (!isValidUuid(boardId)) {
    return badRequest('Invalid board ID format');
  }

  if (!(await canViewBoard(auth, boardId))) {
    return unauthorized();
  }

  const widgets = await getBoardWidgets(boardId);

  return json(widgets);
}

export async function POST(request: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const schema = z.object({
    websiteId: z.string().uuid(),
    type: z.enum(WIDGET_TYPES),
    title: z.string().max(100).optional(),
    config: z.any().nullable().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { boardId } = await params;
  const { websiteId, type, title, config } = body;

  if (!isValidUuid(boardId)) {
    return badRequest('Invalid board ID format');
  }

  if (!(await canCreateBoardWidget(auth, boardId))) {
    return unauthorized();
  }

  try {
    const position = await getMaxWidgetPosition(boardId);
    const result = await createBoardWidget({
      boardId,
      websiteId,
      type,
      title,
      config,
      position,
    });

    return Response.json(result);
  } catch (e: any) {
    return serverError(e);
  }
}
