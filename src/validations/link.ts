import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants';
import type { Auth } from '@/lib/types';
import { getLink, getOrgUser } from '@/queries/drizzle';

export async function canViewLink({ user }: Auth, linkId: string) {
  if (user?.isAdmin) {
    return true;
  }

  const link = await getLink(linkId);

  if (link.userId) {
    return user?.userId === link.userId;
  }

  if (link.orgId) {
    const orgUser = await getOrgUser(link.orgId, user?.userId);

    return !!orgUser;
  }

  return false;
}

export async function canUpdateLink({ user }: Auth, linkId: string) {
  if (user?.isAdmin) {
    return true;
  }

  const link = await getLink(linkId);

  if (link.userId) {
    return user?.userId === link.userId;
  }

  if (link.orgId) {
    const orgUser = await getOrgUser(link.orgId, user?.userId);

    return orgUser && hasPermission(orgUser.role, PERMISSIONS.websiteUpdate);
  }

  return false;
}

export async function canDeleteLink({ user }: Auth, linkId: string) {
  if (user?.isAdmin) {
    return true;
  }

  const link = await getLink(linkId);

  if (link.userId) {
    return user?.userId === link.userId;
  }

  if (link.orgId) {
    const orgUser = await getOrgUser(link.orgId, user?.userId);

    return orgUser && hasPermission(orgUser.role, PERMISSIONS.websiteDelete);
  }

  return false;
}
