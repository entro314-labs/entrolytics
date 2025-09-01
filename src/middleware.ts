import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

export default clerkMiddleware(async (auth, req) => {
  // Define routes that require authentication
  const protectedRoutes = createRouteMatcher([
    '/',
    '/dashboard(.*)',
    '/admin(.*)',
    '/settings(.*)',
    '/teams(.*)',
    '/websites(.*)',
    '/reports(.*)',
  ])

  const protectedApiRoutes = createRouteMatcher([
    '/api/me(.*)',
    '/api/users(.*)',
    '/api/teams(.*)',
    '/api/websites(.*)',
    '/api/admin(.*)',
    '/api/reports(.*)',
    '/api/links(.*)',
    '/api/pixels(.*)',
  ])

  // Protect page routes (redirect to sign-in)
  if (protectedRoutes(req)) {
    auth.protect()
  }

  // For API routes, let the route handlers handle auth validation
  // The middleware will still process the auth, but won't redirect
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}