import { z } from 'zod';
import { uuid } from '@/lib/crypto';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams } from '@/lib/schema';
import { createBoard, getUserBoards } from '@/queries/drizzle';
import { canCreateBoard, canCreateOrgBoard } from '@/validations';

export async function GET(request: Request) {
  if (!request || typeof request !== 'object' || !('url' in request)) {
    return new Response('Build time', { status: 200 });
  }

  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  });

  const { auth, query, error } = (await parseRequest(request, schema)) || {};

  if (error) {
    return error();
  }

  const filters = await getQueryFilters(query);

  const boards = await getUserBoards(auth?.user.userId, filters);

  return json(boards);
}

export async function POST(request: Request) {
  if (!request || typeof request !== 'object' || !('url' in request)) {
    return new Response('Build time', { status: 200 });
  }

  const schema = z.object({
    name: z.string().max(100),
    description: z.string().max(500).nullable().optional(),
    config: z.any().nullable().optional(),
    orgId: z.string().nullable().optional(),
    id: z.string().uuid().nullable().optional(),
  });

  const { auth, body, error } = (await parseRequest(request, schema)) || {};

  if (error) {
    return error();
  }

  const { id, name, description, config, orgId } = body || {};

  if ((orgId && !(await canCreateOrgBoard(auth, orgId))) || !(await canCreateBoard(auth))) {
    return unauthorized();
  }

  const data: any = {
    id: id ?? uuid(),
    name,
    description,
    config,
    org_id: orgId,
  };

  if (!orgId) {
    data.user_id = auth?.user.userId;
  }

  const result = await createBoard(data);

  return json(result);
}
