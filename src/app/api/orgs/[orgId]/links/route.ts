import { z } from 'zod';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams } from '@/lib/schema';
import { getOrgLinks } from '@/queries/drizzle';
import { canViewOrg } from '@/validations';

export async function GET(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  });
  const { orgId } = await params;
  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!(await canViewOrg(auth, orgId))) {
    return unauthorized();
  }

  const filters = await getQueryFilters(query);

  const links = await getOrgLinks(orgId, filters);

  return json(links);
}
