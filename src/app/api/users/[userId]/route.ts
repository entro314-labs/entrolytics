import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { badRequest, json, notFound, ok, unauthorized } from '@/lib/response';
import { userRoleParam } from '@/lib/schema';
import {
  deleteUser,
  getUser,
  getUserByClerkId,
  getUserByEmail,
  updateUser,
} from '@/queries/drizzle';
import { canDeleteUser, canUpdateUser, canViewUser } from '@/validations';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { userId } = await params;

  if (!(await canViewUser(auth, userId))) {
    return unauthorized();
  }

  // userId parameter is the Clerk ID from URL
  const user = await getUserByClerkId(userId);

  if (!user) {
    return notFound();
  }

  return json(user);
}

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const schema = z.object({
    firstName: z.string().max(255).optional(),
    lastName: z.string().max(255).optional(),
    displayName: z.string().max(255).optional(),
    role: userRoleParam.optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { userId } = await params;

  if (!(await canUpdateUser(auth, userId))) {
    return unauthorized();
  }

  const { firstName, lastName, displayName, role } = body;

  const data: any = {};

  if (firstName !== undefined) {
    data.first_name = firstName;
  }

  if (lastName !== undefined) {
    data.last_name = lastName;
  }

  if (displayName !== undefined) {
    data.display_name = displayName;
  }

  // Only admin can change role
  if (role && auth.user.isAdmin) {
    data.role = role;
  }

  // Get database user ID from Clerk ID
  const targetUser = await getUserByClerkId(userId);
  if (!targetUser) {
    return notFound();
  }

  const updated = await updateUser(targetUser.userId, data);

  return json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { userId } = await params;

  if (!(await canDeleteUser(auth))) {
    return unauthorized();
  }

  // userId parameter is the Clerk ID from URL
  if (userId === auth.user.clerkId) {
    return badRequest('You cannot delete yourself.');
  }

  // Get database user ID from Clerk ID
  const targetUser = await getUserByClerkId(userId);
  if (!targetUser) {
    return notFound();
  }

  await deleteUser(targetUser.userId);

  return ok();
}
