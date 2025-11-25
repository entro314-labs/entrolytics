import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams } from '@/lib/schema';
import { getOrgs } from '@/queries/drizzle';
import { canViewAllOrgs } from '@/validations';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!(await canViewAllOrgs(auth))) {
    return unauthorized();
  }

  const orgs = await getOrgs({}, query);

  return json(orgs);
}
