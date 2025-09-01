import { z } from 'zod';
import { pagingParams } from '@/lib/schema';
import { getUserTeams, getUserByClerkId } from '@/queries';
import { unauthorized, json, notFound } from '@/lib/response';
import { parseRequest } from '@/lib/request';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const schema = z.object({
    ...pagingParams,
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
    if (auth.clerkUserId !== userId && !auth.user.isAdmin) {
      return unauthorized();
    }
  } else {
    // Direct internal ID access
    internalUserId = userId;
    
    // Check authorization
    if (auth.user.id !== userId && !auth.user.isAdmin) {
      return unauthorized();
    }
  }

  const teams = await getUserTeams(internalUserId, query);

  return json(teams);
}
