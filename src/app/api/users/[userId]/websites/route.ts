import { z } from 'zod';
import { unauthorized, json, notFound } from '@/lib/response';
import { getUserWebsites } from '@/queries/prisma/website';
import { getUserByClerkId } from '@/queries';
import { pagingParams, searchParams } from '@/lib/schema';
import { getQueryFilters, parseRequest } from '@/lib/request';

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

  // Check if userId is a Clerk ID (starts with 'user_') or internal database ID
  const isClerkId = userId.startsWith('user_');
  let targetUser;
  let internalUserId;
  
  if (isClerkId) {
    // Convert Clerk ID to internal user
    targetUser = await getUserByClerkId(userId);
    if (!targetUser) {
      return notFound();
    }
    internalUserId = targetUser.id;
    
    // Check authorization - user can access their own data or admin can access any
    if (!auth.user.isAdmin && auth.clerkUserId !== userId) {
      return unauthorized();
    }
  } else {
    // Direct internal ID access
    internalUserId = userId;
    
    // Check authorization
    if (!auth.user.isAdmin && auth.user.id !== userId) {
      return unauthorized();
    }
  }

  const filters = await getQueryFilters(query);

  const websites = await getUserWebsites(internalUserId, filters);

  return json(websites);
}
