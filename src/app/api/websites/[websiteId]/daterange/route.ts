import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { getWebsiteDateRange } from '@/queries/sql';
import { canViewWebsite } from '@/validations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const dateRange = await getWebsiteDateRange(websiteId);

  return json(dateRange);
}
