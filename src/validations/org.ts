import { hasPermission } from '@/lib/auth';
import { PERMISSIONS, ROLES } from '@/lib/constants';
import {
  hasPermission as hasClerkPermission,
  hasOrgRole,
  hasRole,
  isAdmin,
} from '@/lib/permissions';
import type { Auth } from '@/lib/types';
import { getOrgUser } from '@/queries/drizzle';

const edgeMode = !!process.env.EDGE_MODE;

export async function canViewOrg({ user }: Auth, orgId: string) {
  // Platform admin can view any org
  if (user?.isAdmin || (await isAdmin())) {
    return true;
  }

  // Check Clerk organization membership
  if (
    (await hasOrgRole(orgId, 'member')) ||
    (await hasOrgRole(orgId, 'admin')) ||
    (await hasOrgRole(orgId, 'manager'))
  ) {
    return true;
  }

  // Fallback to legacy org membership table
  const orgUser = await getOrgUser(orgId, user?.userId);
  return !!orgUser;
}

export async function canCreateOrg({ user, grant }: Auth) {
  // All authenticated users can create orgs (included in ROLE_PERMISSIONS[ROLES.user])
  if (!user) {
    return false;
  }

  if (edgeMode) {
    return (
      !!grant?.find(a => a === PERMISSIONS.orgCreate) ||
      (await hasClerkPermission(PERMISSIONS.orgCreate))
    );
  }

  // Platform admin always has permission
  if (user.isAdmin || (await isAdmin())) {
    return true;
  }

  // Regular users have orgCreate permission by default
  return true;
}

export async function canUpdateOrg({ user, grant }: Auth, orgId: string) {
  // Platform admin can update any org
  if (user?.isAdmin || (await isAdmin())) {
    return true;
  }

  if (edgeMode) {
    return (
      !!grant?.find(a => a === PERMISSIONS.orgUpdate) ||
      (await hasClerkPermission(PERMISSIONS.orgUpdate))
    );
  }

  // Check Clerk organization role first
  if ((await hasOrgRole(orgId, 'admin')) || (await hasOrgRole(orgId, 'manager'))) {
    return true;
  }

  // Fallback to legacy system
  const orgUser = await getOrgUser(orgId, user?.userId);
  return orgUser && hasPermission(orgUser.role, PERMISSIONS.orgUpdate);
}

export async function canDeleteOrg({ user }: Auth, orgId: string) {
  // Platform admin can delete any org
  if (user?.isAdmin || (await isAdmin())) {
    return true;
  }

  // Only org admins can delete organizations
  if (await hasOrgRole(orgId, 'admin')) {
    return true;
  }

  // Fallback to legacy system
  const orgUser = await getOrgUser(orgId, user?.userId);
  return orgUser && hasPermission(orgUser.role, PERMISSIONS.orgDelete);
}

export async function canAddUserToOrg({ user, grant }: Auth) {
  if (edgeMode) {
    return (
      !!grant?.find(a => a === PERMISSIONS.orgUpdate) ||
      (await hasClerkPermission(PERMISSIONS.orgUpdate))
    );
  }

  return user?.isAdmin || (await isAdmin());
}

export async function canDeleteOrgUser({ user }: Auth, orgId: string, removeUserId: string) {
  // Platform admin can remove any user
  if (user?.isAdmin || (await isAdmin())) {
    return true;
  }

  // Users can remove themselves
  if (removeUserId === user?.userId) {
    return true;
  }

  // Org admins and managers can remove users
  if ((await hasOrgRole(orgId, 'admin')) || (await hasOrgRole(orgId, 'manager'))) {
    return true;
  }

  // Fallback to legacy system
  const orgUser = await getOrgUser(orgId, user?.userId);
  return orgUser && hasPermission(orgUser.role, PERMISSIONS.orgUpdate);
}

export async function canCreateOrgWebsite({ user }: Auth, orgId: string) {
  // Platform admin can create websites anywhere
  if (user?.isAdmin || (await isAdmin())) {
    return true;
  }

  // Check Clerk organization permissions
  if (
    (await hasOrgRole(orgId, 'admin')) ||
    (await hasOrgRole(orgId, 'manager')) ||
    (await hasOrgRole(orgId, 'member'))
  ) {
    return true;
  }

  // Fallback to legacy system
  const orgUser = await getOrgUser(orgId, user?.userId);
  return orgUser && hasPermission(orgUser.role, PERMISSIONS.websiteCreate);
}

export async function canViewAllOrgs({ user }: Auth) {
  return user?.isAdmin || (await isAdmin());
}
