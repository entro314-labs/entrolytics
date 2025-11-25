import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { getWebsiteSession } from '@/queries/sql';
import { canViewWebsite } from '@/validations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; sessionId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, sessionId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getWebsiteSession(websiteId, sessionId);

  return json(data);
}
