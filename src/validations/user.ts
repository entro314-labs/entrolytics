import { Auth } from '@/lib/types';

export async function canCreateUser({ user }: Auth) {
  return user.isAdmin;
}

export async function canViewUser(auth: Auth, viewedUserId: string) {
  const { user, clerkUserId } = auth;
  
  if (user.isAdmin) {
    return true;
  }

  // Check if userId is a Clerk ID or internal database ID
  const isClerkId = viewedUserId.startsWith('user_');
  const userIdToCompare = isClerkId ? clerkUserId : user.id;
  
  return userIdToCompare === viewedUserId;
}

export async function canViewUsers({ user }: Auth) {
  return user.isAdmin;
}

export async function canUpdateUser(auth: Auth, viewedUserId: string) {
  const { user, clerkUserId } = auth;
  
  if (user.isAdmin) {
    return true;
  }

  // Check if userId is a Clerk ID or internal database ID
  const isClerkId = viewedUserId.startsWith('user_');
  const userIdToCompare = isClerkId ? clerkUserId : user.id;
  
  return userIdToCompare === viewedUserId;
}

export async function canDeleteUser({ user }: Auth) {
  return user.isAdmin;
}
