import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { getSessionData } from '@/queries/sql';
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

  const data = await getSessionData(websiteId, sessionId);

  return json(data);
}
