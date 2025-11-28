import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/send',
  '/api/scripts/(.*)',
  '/api/heartbeat',
  '/api/webhooks/(.*)',
  '/script.js',
  '/telemetry.js',
  // CLI OAuth routes
  '/cli(.*)',
  '/api/cli/(.*)',
  '/api/auth/cli/(.*)',
  // Marketing/public pages
  '/privacy',
  '/terms',
  '/cookies',
  '/gdpr',
  '/dpa',
  '/about',
  '/contact',
  '/pricing',
  '/faq',
  '/changelog',
  '/features',
  '/use-cases',
  '/integrations',
  '/blog(.*)',
  '/careers',
  '/security',
  '/accessibility',
  '/sitemap',
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/settings(.*)',
  '/orgs(.*)',
  '/websites(.*)',
  '/reports(.*)',
  '/boards(.*)',
  '/links(.*)',
  '/pixels(.*)',
  '/console(.*)',
]);

const isProtectedApiRoute = createRouteMatcher([
  '/api/me(.*)',
  '/api/users(.*)',
  '/api/orgs(.*)',
  '/api/websites(.*)',
  '/api/admin(.*)',
  '/api/reports(.*)',
  '/api/links(.*)',
  '/api/pixels(.*)',
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);

/**
 * Check if request has a Bearer token (CLI authentication)
 * These requests should bypass Clerk middleware and be validated in the route handler
 */
function hasBearerToken(req: Request): boolean {
  const authHeader = req.headers.get('authorization');
  return authHeader?.startsWith('Bearer ') || false;
}

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes to proceed without authentication
  if (isPublicRoute(req)) {
    return;
  }

  // Allow Bearer token requests to proceed - they will be validated in route handlers
  // This enables CLI tools to authenticate without Clerk sessions
  if (hasBearerToken(req)) {
    return;
  }

  // Protect onboarding routes - must be authenticated
  if (isOnboardingRoute(req)) {
    await auth.protect();
    return;
  }

  // For protected page routes, check authentication
  // Note: Onboarding redirect is handled client-side in App.tsx for better UX
  if (isProtectedRoute(req)) {
    await auth.protect();
    return;
  }

  // Protect API routes (return 401 for unauthenticated requests)
  if (isProtectedApiRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
