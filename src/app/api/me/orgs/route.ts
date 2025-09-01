import { z } from 'zod';
import { pagingParams } from '@/lib/schema';
import { getUserOrgs } from '@/queries';
import { json } from '@/lib/response';
import { getQueryFilters, parseRequest } from '@/lib/request';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const filters = await getQueryFilters(query);

  const orgs = await getUserOrgs(auth.user.id, filters);

  return json(orgs);
}
