import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Entrolytics Authentication Middleware
 * 
 * Built on Clerk for secure, modern authentication.
 * By default, all routes are public. We explicitly protect routes that need authentication.
 */

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/',               // Root/dashboard
  '/dashboard(.*)',  // Dashboard routes
  '/admin(.*)',      // Admin functions
  '/settings(.*)',   // User and team settings
  '/teams(.*)',      // Team management
  '/websites(.*)',   // Website management
  '/reports(.*)',    // Reports
]);

// API routes that require authentication
const isProtectedApiRoute = createRouteMatcher([
  '/api/me(.*)',
  '/api/users(.*)',
  '/api/teams(.*)',
  '/api/websites(.*)',
  '/api/admin(.*)',
  '/api/reports(.*)',
  '/api/links(.*)',
  '/api/pixels(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect specific routes
  if (isProtectedRoute(req) || isProtectedApiRoute(req)) {
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