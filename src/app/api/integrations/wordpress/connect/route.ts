import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * WordPress Integration Connect Flow
 *
 * This endpoint handles the OAuth-style connection flow from WordPress sites.
 *
 * Flow:
 * 1. WordPress plugin redirects user here with callback_url, site_url, site_name, state
 * 2. If user not logged in, redirect to sign-in with return_url back here
 * 3. Show website selection UI (or create new website)
 * 4. Redirect back to WordPress callback_url with website_id and state
 */

const querySchema = z.object({
  callback_url: z.string().url(),
  site_url: z.string().url(),
  site_name: z.string().optional(),
  state: z.string().min(16),
  platform: z.literal('wordpress').optional(),
  version: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const searchParams = request.nextUrl.searchParams;

  // Validate query parameters
  const parseResult = querySchema.safeParse({
    callback_url: searchParams.get('callback_url'),
    site_url: searchParams.get('site_url'),
    site_name: searchParams.get('site_name'),
    state: searchParams.get('state'),
    platform: searchParams.get('platform'),
    version: searchParams.get('version'),
  });

  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: 'invalid_request',
        error_description: 'Missing or invalid parameters',
        details: parseResult.error.flatten(),
      },
      { status: 400 },
    );
  }

  const { callback_url, site_url, site_name, state, platform, version } = parseResult.data;

  // Store the connect request in session/cookie for after auth
  const connectData = {
    callback_url,
    site_url,
    site_name: site_name || new URL(site_url).hostname,
    state,
    platform: platform || 'wordpress',
    version,
  };

  // If not authenticated, redirect to sign-in
  if (!userId) {
    // Encode connect data for return URL
    const connectDataEncoded = encodeURIComponent(JSON.stringify(connectData));
    const returnUrl = `/integrations/wordpress/select?data=${connectDataEncoded}`;

    return NextResponse.redirect(
      new URL(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`, request.url),
    );
  }

  // User is authenticated, redirect to website selection page
  const connectDataEncoded = encodeURIComponent(JSON.stringify(connectData));
  return NextResponse.redirect(
    new URL(`/integrations/wordpress/select?data=${connectDataEncoded}`, request.url),
  );
}
