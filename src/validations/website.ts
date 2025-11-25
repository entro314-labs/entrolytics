import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants';
import type { Auth } from '@/lib/types';
import { getOrgUser, getWebsite } from '@/queries/drizzle';

const edgeMode = !!process.env.EDGE_MODE;

export async function canViewWebsite({ user, shareToken }: Auth, websiteId: string) {
  if (user?.isAdmin) {
    return true;
  }

  if (shareToken?.websiteId === websiteId) {
    return true;
  }

  const website = await getWebsite(websiteId);

  if (!website) {
    return false;
  }

  if (website.userId) {
    return user?.userId === website.userId;
  }

  if (website.orgId) {
    const orgUser = await getOrgUser(website.orgId, user?.userId);

    return !!orgUser;
  }

  return false;
}

export async function canViewAllWebsites({ user }: Auth) {
  return user?.isAdmin;
}

export async function canCreateWebsite({ user, grant }: Auth) {
  if (edgeMode) {
    return !!grant?.find(a => a === PERMISSIONS.websiteCreate);
  }

  if (user?.isAdmin) {
    return true;
  }

  return hasPermission(user?.role, PERMISSIONS.websiteCreate);
}

export async function canUpdateWebsite({ user }: Auth, websiteId: string) {
  if (user?.isAdmin) {
    return true;
  }

  const website = await getWebsite(websiteId);

  if (!website) {
    return false;
  }

  if (website.userId) {
    return user?.userId === website.userId;
  }

  if (website.orgId) {
    const orgUser = await getOrgUser(website.orgId, user?.userId);

    return orgUser && hasPermission(orgUser.role, PERMISSIONS.websiteUpdate);
  }

  return false;
}

export async function canDeleteWebsite({ user }: Auth, websiteId: string) {
  if (user?.isAdmin) {
    return true;
  }

  const website = await getWebsite(websiteId);

  if (!website) {
    return false;
  }

  if (website.userId) {
    return user?.userId === website.userId;
  }

  if (website.orgId) {
    const orgUser = await getOrgUser(website.orgId, user?.userId);

    return orgUser && hasPermission(orgUser.role, PERMISSIONS.websiteDelete);
  }

  return false;
}

export async function canTransferWebsiteToUser({ user }: Auth, websiteId: string, userId: string) {
  const website = await getWebsite(websiteId);

  if (!website) {
    return false;
  }

  if (website.orgId && user?.userId === userId) {
    const orgUser = await getOrgUser(website.orgId, userId);

    return orgUser && hasPermission(orgUser.role, PERMISSIONS.websiteTransferToUser);
  }

  return false;
}

export async function canTransferWebsiteToOrg({ user }: Auth, websiteId: string, orgId: string) {
  const website = await getWebsite(websiteId);

  if (!website) {
    return false;
  }

  if (website.userId && website.userId === user?.userId) {
    const orgUser = await getOrgUser(orgId, user?.userId);

    return orgUser && hasPermission(orgUser.role, PERMISSIONS.websiteTransferToOrg);
  }

  return false;
}
