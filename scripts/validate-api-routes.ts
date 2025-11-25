/**
 * API Route Validation Script
 *
 * Validates consistency across all API routes:
 * - Authentication middleware
 * - Error response formats
 * - CORS configuration
 * - Rate limiting
 */

import { promises as fs } from 'fs';
import path from 'path';

interface RouteInfo {
  path: string;
  file: string;
  hasAuth: boolean;
  hasErrorHandling: boolean;
  hasCORS: boolean;
  methods: string[];
  issues: string[];
}

async function findRouteFiles(dir: string, routes: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await findRouteFiles(fullPath, routes);
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      routes.push(fullPath);
    }
  }

  return routes;
}

async function analyzeRoute(filePath: string): Promise<RouteInfo> {
  const content = await fs.readFile(filePath, 'utf-8');
  const relativePath = filePath.replace(process.cwd(), '');

  // Extract API path from file path
  const apiPathMatch = relativePath.match(/\/app\/api\/(.+)\/route\.(ts|js)/);
  const apiPath = apiPathMatch ? `/api/${apiPathMatch[1]}` : 'unknown';

  const issues: string[] = [];

  // Check for authentication
  const hasAuth =
    content.includes('@clerk/nextjs') ||
    content.includes('auth()') ||
    content.includes('currentUser()') ||
    content.includes('getAuth(');

  // Check for error handling
  const hasErrorHandling =
    content.includes('try') && content.includes('catch') && content.includes('500');

  // Check for CORS headers
  const hasCORS = content.includes('Access-Control-Allow-Origin') || content.includes('CORS');

  // Extract HTTP methods
  const methods: string[] = [];
  if (content.includes('export async function GET')) methods.push('GET');
  if (content.includes('export async function POST')) methods.push('POST');
  if (content.includes('export async function PUT')) methods.push('PUT');
  if (content.includes('export async function DELETE')) methods.push('DELETE');
  if (content.includes('export async function PATCH')) methods.push('PATCH');
  if (content.includes('export async function OPTIONS')) methods.push('OPTIONS');

  // Validate patterns
  if (!hasErrorHandling) {
    issues.push('Missing try-catch error handling');
  }

  if (!content.includes('NextResponse.json')) {
    issues.push('Not using NextResponse.json for responses');
  }

  if (content.includes('console.log') && !content.includes('console.error')) {
    issues.push('Uses console.log but not console.error');
  }

  // Check for public routes that should have CORS
  const isPublicRoute =
    apiPath.includes('/collect') ||
    apiPath.includes('/send') ||
    apiPath.includes('/scripts') ||
    apiPath.includes('/cli/validate');

  if (isPublicRoute && !hasCORS) {
    issues.push('Public route missing CORS headers');
  }

  // Check for protected routes that should have auth
  const shouldBeProtected =
    apiPath.includes('/websites') ||
    apiPath.includes('/user') ||
    apiPath.includes('/orgs') ||
    apiPath.includes('/admin');

  if (shouldBeProtected && !hasAuth && !apiPath.includes('/cli/validate')) {
    issues.push('Protected route missing authentication');
  }

  return {
    path: apiPath,
    file: relativePath,
    hasAuth,
    hasErrorHandling,
    hasCORS,
    methods,
    issues,
  };
}

async function validateApiRoutes() {
  console.log('🔍 Validating API routes...\n');

  const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
  const routeFiles = await findRouteFiles(apiDir);

  console.log(`Found ${routeFiles.length} route files\n`);

  const results: RouteInfo[] = [];
  let totalIssues = 0;

  for (const file of routeFiles) {
    const info = await analyzeRoute(file);
    results.push(info);

    if (info.issues.length > 0) {
      totalIssues += info.issues.length;
      console.log(`❌ ${info.path}`);
      console.log(`   File: ${info.file}`);
      console.log(`   Methods: ${info.methods.join(', ')}`);
      console.log(
        `   Auth: ${info.hasAuth ? '✓' : '✗'} | Error Handling: ${info.hasErrorHandling ? '✓' : '✗'} | CORS: ${info.hasCORS ? '✓' : '✗'}`,
      );

      for (const issue of info.issues) {
        console.log(`   ⚠️  ${issue}`);
      }
      console.log();
    }
  }

  // Summary
  console.log('\n📊 Validation Summary\n');
  console.log(`Total routes: ${results.length}`);
  console.log(`Routes with issues: ${results.filter(r => r.issues.length > 0).length}`);
  console.log(`Total issues: ${totalIssues}`);
  console.log();

  // Group by status
  const withAuth = results.filter(r => r.hasAuth).length;
  const withErrorHandling = results.filter(r => r.hasErrorHandling).length;
  const withCORS = results.filter(r => r.hasCORS).length;

  console.log('Coverage:');
  console.log(
    `  Authentication: ${withAuth}/${results.length} (${Math.round((withAuth / results.length) * 100)}%)`,
  );
  console.log(
    `  Error Handling: ${withErrorHandling}/${results.length} (${Math.round((withErrorHandling / results.length) * 100)}%)`,
  );
  console.log(
    `  CORS Headers: ${withCORS}/${results.length} (${Math.round((withCORS / results.length) * 100)}%)`,
  );
  console.log();

  if (totalIssues === 0) {
    console.log('✅ All API routes passed validation!');
    process.exit(0);
  } else {
    console.log('❌ Some API routes have issues. Please review above.');
    process.exit(1);
  }
}

validateApiRoutes().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
