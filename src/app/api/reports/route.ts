import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { uuid } from '@/lib/crypto';
import { report } from '@/lib/db';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, reportSchema, reportTypeParam } from '@/lib/schema';
import { createReport, getReports } from '@/queries/drizzle';
import { canUpdateWebsite, canViewWebsite } from '@/validations';

export async function GET(request: Request) {
  const schema = z.object({
    websiteId: z.string().uuid().optional(),
    type: reportTypeParam.optional(),
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { page, search, pageSize, websiteId, type } = query;
  const filters = {
    page,
    pageSize,
    search,
  };

  if (websiteId && !(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  // Build Drizzle ORM conditions
  const conditions = [];
  if (websiteId) conditions.push(eq(report.websiteId, websiteId));
  if (type) conditions.push(eq(report.type, type));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await getReports(whereClause, filters);

  return json(data);
}

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportSchema);

  if (error) {
    return error();
  }

  const { websiteId, type, name, description, parameters } = body;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const result = await createReport({
    id: uuid(),
    userId: auth.user.userId,
    websiteId,
    type,
    name,
    description: description || '',
    parameters,
  });

  return json(result);
}
