import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Entrolytics Authentication Middleware
 * 
 * Built on Clerk for secure, modern authentication.
 * Protects application routes and API endpoints.
 * 
 * Protected routes:
 * - /dashboard/* - Main application dashboard and analytics
 * - /admin/* - Administrative functions 
 * - /settings/* - User and team settings
 * - /teams/* - Team management pages
 * - /api/* - API routes (with some exceptions)
 */

// Define route matchers for different protection levels
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/settings(.*)',
  '/teams(.*)',
]);

// API routes that require authentication
const isProtectedApiRoute = createRouteMatcher([
  '/api/me(.*)',
  '/api/users(.*)',
  '/api/teams(.*)',
  '/api/websites(.*)',
  '/api/admin(.*)',
  '/api/reports(.*)',
]);

// Public API routes that don't need authentication
const isPublicApiRoute = createRouteMatcher([
  '/api/send(.*)',       // Analytics collection endpoint
  '/api/heartbeat',      // Health check
  '/api/batch',          // Batch analytics
  '/api/webhooks/(.*)',  // Webhook endpoints
]);

// Public routes that should remain accessible
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/share/(.*)',  // Shared dashboard access
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes and public API routes
  if (isPublicRoute(req) || isPublicApiRoute(req)) {
    return;
  }

  // Protect main application routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Protect API routes
  if (isProtectedApiRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};