/**
 * TypeScript definitions for Clerk RBAC implementation
 * Extends Clerk's built-in types for custom role and permission handling
 */

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: 'admin' | 'user' | 'view-only'
    }
    org_id?: string
    org_role?: 'admin' | 'manager' | 'member'
  }

  interface UserPublicMetadata {
    role?: 'admin' | 'user' | 'view-only'
  }

  interface OrganizationPublicMetadata {
    plan?: 'free' | 'pro' | 'enterprise'
    features?: string[]
  }
}

export type PlatformRole = 'admin' | 'user' | 'view-only'
export type OrganizationRole = 'admin' | 'manager' | 'member'

export interface RolePermissions {
  platform: string[]
  organization: string[]
}

export interface UserWithRole {
  id: string
  email: string
  role: PlatformRole
  organizationMemberships?: {
    orgId: string
    orgName: string
    role: OrganizationRole
  }[]
}

export interface AuthContext {
  userId: string | null
  orgId: string | null
  orgRole: OrganizationRole | null
  platformRole: PlatformRole | null
  isAdmin: boolean
}

export {}
