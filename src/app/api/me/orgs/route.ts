import { z } from 'zod';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json } from '@/lib/response';
import { pagingParams } from '@/lib/schema';
import { getUserOrgs } from '@/queries/drizzle';

export async function GET(request: Request) {
  // Check if we're in a build context
  if (!request || typeof request !== 'object' || !('url' in request)) {
    return new Response('Build time', { status: 200 });
  }

  const schema = z.object({
    ...pagingParams,
  });

  const { auth, query, error } = (await parseRequest(request, schema)) || {};

  if (error) {
    return error();
  }

  const filters = await getQueryFilters(query);

  const orgs = await getUserOrgs(auth?.user?.userId, filters);

  return json(orgs);
}
