import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json, notFound, unauthorized } from '@/lib/response';
import { pagingParams } from '@/lib/schema';
import { getUserByClerkId, getUserOrgs } from '@/queries/drizzle';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const schema = z.object({
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { userId } = await params;

  // userId parameter should be the Clerk ID
  // Check authorization - user can access their own data or admin can access any
  if (auth.user.clerkId !== userId && !auth.user.isAdmin) {
    return unauthorized();
  }

  const targetUser = await getUserByClerkId(userId);

  if (!targetUser) {
    return notFound('User not found.');
  }

  // Use the database user ID to find organizations
  const orgs = await getUserOrgs(targetUser.userId, query);

  return json(orgs);
}
