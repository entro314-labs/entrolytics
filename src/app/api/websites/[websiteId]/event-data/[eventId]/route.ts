import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { getEventData } from '@/queries/sql/events/getEventData';
import { canViewWebsite } from '@/validations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; eventId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, eventId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getEventData(websiteId, eventId);

  return json(data);
}
