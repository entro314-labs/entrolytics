/**
 * Entrolytics Client Authentication
 *
 * Entrolytics uses Clerk for all authentication needs.
 * Client-side auth is handled automatically by Clerk's React components and hooks.
 *
 * Use Clerk hooks for client-side auth state:
 * - useUser() - Get current user
 * - useAuth() - Get auth state and actions
 * - useSession() - Get session data
 */

/**
 * Legacy function for SSO compatibility
 * Since we use Clerk, this is a no-op but maintained for backward compatibility
 */
export function setClientAuthToken(token: string): void {
  // With Clerk, authentication is handled automatically
  // This function is kept for backward compatibility with existing SSO flows
  console.warn('setClientAuthToken is deprecated - Clerk handles authentication automatically')
}
