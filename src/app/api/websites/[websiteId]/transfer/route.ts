import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { updateWebsite } from '@/queries/drizzle';
import { canTransferWebsiteToOrg, canTransferWebsiteToUser } from '@/validations';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    userId: z.string().uuid().optional(),
    orgId: z.string().uuid().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { userId, orgId } = body;

  if (userId) {
    if (!(await canTransferWebsiteToUser(auth, websiteId, userId))) {
      return unauthorized();
    }

    const website = await updateWebsite(websiteId, {
      user_id: userId,
      org_id: null,
    });

    return json(website);
  } else if (orgId) {
    if (!(await canTransferWebsiteToOrg(auth, websiteId, orgId))) {
      return unauthorized();
    }

    const website = await updateWebsite(websiteId, {
      user_id: null,
      org_id: orgId,
    });

    return json(website);
  }

  return badRequest();
}
