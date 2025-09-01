import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/send',
  '/api/scripts/(.*)',
  '/api/heartbeat',
  '/api/webhooks/(.*)',
  '/script.js',
  '/telemetry.js'
])

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/',
  '/dashboard(.*)',
  '/admin(.*)',
  '/settings(.*)',
  '/orgs(.*)',
  '/websites(.*)',
  '/reports(.*)',
])

const isProtectedApiRoute = createRouteMatcher([
  '/api/me(.*)',
  '/api/users(.*)',
  '/api/orgs(.*)',
  '/api/websites(.*)',
  '/api/admin(.*)',
  '/api/reports(.*)',
  '/api/links(.*)',
  '/api/pixels(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes to proceed without authentication
  if (isPublicRoute(req)) {
    return
  }

  // Protect page routes (redirect to sign-in)
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  // Protect API routes (return 401 for unauthenticated requests)
  if (isProtectedApiRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}