import { z } from 'zod';
import { canUpdateUser, canViewUser, canDeleteUser } from '@/validations';
import { getUser, getUserByEmail, updateUser, deleteUser } from '@/queries';
import { json, unauthorized, badRequest, ok, notFound } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { userRoleParam } from '@/lib/schema';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { userId } = await params;

  if (!(await canViewUser(auth, userId))) {
    return unauthorized();
  }

  // userId is now Clerk ID directly (primary key)
  const user = await getUser(userId);

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
    data.firstName = firstName;
  }

  if (lastName !== undefined) {
    data.lastName = lastName;
  }

  if (displayName !== undefined) {
    data.displayName = displayName;
  }

  // Only admin can change role
  if (role && auth.user.isAdmin) {
    data.role = role;
  }

  // userId is now Clerk ID directly (primary key)
  const updated = await updateUser(userId, data);

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

  // userId is now Clerk ID directly (primary key)
  if (userId === auth.user.id) {
    return badRequest('You cannot delete yourself.');
  }

  await deleteUser(userId);

  return ok();
}
