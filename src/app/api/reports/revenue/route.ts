import { getQueryFilters, parseRequest, setWebsiteDate } from '@/lib/request';
import { json, serverError, unauthorized } from '@/lib/response';
import { reportResultSchema } from '@/lib/schema';
import { getRevenue, type RevenuParameters } from '@/queries/sql/reports/getRevenue';
import { canViewWebsite } from '@/validations';

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportResultSchema);

  if (error) {
    return error();
  }

  const { websiteId } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  try {
    const parameters = await setWebsiteDate(websiteId, body.parameters);
    const filters = await getQueryFilters(body.filters, websiteId);

    const data = await getRevenue(websiteId, parameters as RevenuParameters, filters);

    return json(data);
  } catch (err) {
    const error = err as Error;
    console.error('[API Error] /api/reports/revenue:', {
      websiteId,
      body,
      error: error.message,
      stack: error.stack,
    });
    return serverError({ message: error.message, stack: error.stack });
  }
}
