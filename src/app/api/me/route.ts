import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';

/**
 * Get Current User Information
 * 
 * Returns the authenticated user's profile data.
 * This endpoint now works with Clerk authentication instead of JWT tokens.
 */
export async function GET(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  // Return user data with Clerk information
  return json({
    user: auth.user,
    clerkUserId: auth.clerkUserId,
    orgId: auth.orgId,
  });
}
