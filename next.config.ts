import 'dotenv/config';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const pkg = require('./package.json');

const TRACKER_SCRIPT = '/script.js';

const basePath = process.env.BASE_PATH;
const collectApiEndpoint = process.env.COLLECT_API_ENDPOINT;
const edgeMode = process.env.EDGE_MODE;
const edgeUrl = process.env.EDGE_URL;
const enableEdgeProxy = process.env.ENABLE_EDGE_PROXY;
const corsMaxAge = process.env.CORS_MAX_AGE;
const defaultLocale = process.env.DEFAULT_LOCALE;
const forceSSL = process.env.FORCE_SSL;
const frameAncestors = process.env.ALLOWED_FRAME_URLS ?? '';
const trackerScriptName = process.env.TRACKER_SCRIPT_NAME;
const trackerScriptURL = process.env.TRACKER_SCRIPT_URL;

const contentSecurityPolicy = [
  `default-src 'self'`,
  `img-src * data:`,
  `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.entrolytics.click https://clerk.entrolytics.click https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com https://*.cloudflare.com`,
  `script-src-elem 'self' 'unsafe-inline' https://accounts.entrolytics.click https://clerk.entrolytics.click https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com https://*.cloudflare.com`,
  `style-src 'self' 'unsafe-inline' https://accounts.entrolytics.click https://clerk.entrolytics.click https://*.clerk.accounts.dev https://*.clerk.com`,
  `connect-src 'self' api.entrolytics.click cloud.entrolytics.click https://accounts.entrolytics.click https://clerk.entrolytics.click https://*.clerk.accounts.dev https://*.clerk.com https://api.clerk.com wss://*.clerk.com`,
  `frame-src 'self' https://accounts.entrolytics.click https://clerk.entrolytics.click https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com https://*.cloudflare.com`,
  `frame-ancestors 'self' ${frameAncestors}`,
  `worker-src 'self' blob:`,
];

const defaultHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy
      .join(';')
      .replace(/\s{2,}/g, ' ')
      .trim(),
  },
];

if (forceSSL) {
  defaultHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  });
}

const trackerHeaders = [
  {
    key: 'Access-Control-Allow-Origin',
    value: '*',
  },
  {
    key: 'Cache-Control',
    value: 'public, max-age=86400, must-revalidate',
  },
];

const apiHeaders = [
  {
    key: 'Access-Control-Allow-Origin',
    value: '*',
  },
  {
    key: 'Access-Control-Allow-Headers',
    value: '*',
  },
  {
    key: 'Access-Control-Allow-Methods',
    value: 'GET, DELETE, POST, PUT',
  },
  {
    key: 'Access-Control-Max-Age',
    value: corsMaxAge || '86400',
  },
  {
    key: 'Cache-Control',
    value: 'no-cache',
  },
];

const headers = [
  {
    source: '/api/:path*',
    headers: apiHeaders,
  },
  {
    source: '/:path*',
    headers: defaultHeaders,
  },
  {
    source: TRACKER_SCRIPT,
    headers: trackerHeaders,
  },
];

const rewrites = [];

// Edge proxy for /api/send - routes through edge runtime for lower latency
if (enableEdgeProxy) {
  rewrites.push({
    source: '/api/send',
    destination: '/api/send-edge',
  });
}

if (trackerScriptURL) {
  rewrites.push({
    source: TRACKER_SCRIPT,
    destination: trackerScriptURL,
  });
}

if (collectApiEndpoint) {
  headers.push({
    source: collectApiEndpoint,
    headers: apiHeaders,
  });

  rewrites.push({
    source: collectApiEndpoint,
    destination: '/api/send',
  });
}

const redirects = [
  {
    source: '/settings',
    destination: '/settings/preferences',
    permanent: false,
  },
  {
    source: '/orgs/:id',
    destination: '/orgs/:id/websites',
    permanent: false,
  },
  {
    source: '/orgs/:id/settings',
    destination: '/orgs/:id/settings/preferences',
    permanent: false,
  },
  {
    source: '/admin',
    destination: '/admin/users',
    permanent: false,
  },
];

// Adding rewrites + headers for all alternative tracker script names.
if (trackerScriptName) {
  const names = trackerScriptName?.split(',').map(name => name.trim());

  if (names) {
    names.forEach(name => {
      const normalizedSource = `/${name.replace(/^\/+/, '')}`;

      rewrites.push({
        source: normalizedSource,
        destination: TRACKER_SCRIPT,
      });

      headers.push({
        source: normalizedSource,
        headers: trackerHeaders,
      });
    });
  }
}

if (edgeMode && edgeUrl) {
  redirects.push({
    source: '/settings/:path*',
    destination: `${edgeUrl}/settings/:path*`,
    permanent: false,
  });

  redirects.push({
    source: '/login',
    destination: edgeUrl,
    permanent: false,
  });
}

/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: false,
  env: {
    basePath,
    edgeMode,
    edgeUrl,
    currentVersion: pkg.version,
    defaultLocale,
  },
  basePath,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@neondatabase/serverless'],
  async headers() {
    return headers;
  },
  async rewrites() {
    return [
      ...rewrites,
      {
        source: '/telemetry.js',
        destination: '/api/scripts/telemetry',
      },
      {
        source: '/orgs/:orgId/:path*',
        destination: '/:path*',
      },
    ];
  },
  async redirects() {
    return [...redirects];
  },
};
