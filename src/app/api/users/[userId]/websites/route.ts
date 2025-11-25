import { z } from 'zod';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, notFound, unauthorized } from '@/lib/response';
import { pagingParams, searchParams } from '@/lib/schema';
import { getUserByClerkId, getUserWebsites } from '@/queries/drizzle';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { userId } = await params;

  // userId parameter is the Clerk ID from URL
  // Check authorization - user can access their own data or admin can access any
  if (!auth.user.isAdmin && auth.user.clerkId !== userId) {
    return unauthorized();
  }

  const targetUser = await getUserByClerkId(userId);

  if (!targetUser) {
    return notFound('User not found.');
  }

  const filters = await getQueryFilters(query);

  // Use the target user's database ID for the query
  const websites = await getUserWebsites(targetUser.userId, filters);

  return json(websites);
}
