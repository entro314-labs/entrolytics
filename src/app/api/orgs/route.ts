import { z } from 'zod';
import { getRandomChars, uuid } from '@/lib/crypto';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams } from '@/lib/schema';
import { createOrg, getOrgs, getUserOrgs } from '@/queries/drizzle';
import { canCreateOrg, canViewAllOrgs } from '@/validations';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!auth?.user) {
    console.error('[API /orgs GET] Auth user not found');
    return unauthorized('User authentication required');
  }

  const filters = await getQueryFilters(query);

  // If user is admin, return all orgs, otherwise return user's orgs
  if (await canViewAllOrgs(auth)) {
    const orgs = await getOrgs({}, filters);
    return json(orgs);
  } else {
    const orgs = await getUserOrgs(auth.user.userId, filters);
    return json(orgs);
  }
}

export async function POST(request: Request) {
  try {
    const schema = z.object({
      name: z.string().max(50),
    });

    const { auth, body, error } = await parseRequest(request, schema);

    if (error) {
      console.error('[API /orgs POST] Request parsing error');
      return error();
    }

    if (!auth?.user) {
      console.error('[API /orgs POST] Auth user not found');
      return unauthorized('User authentication failed. Please sign in again.');
    }

    console.log('[API /orgs POST] User authenticated:', {
      userId: auth.user.userId,
      clerkId: auth.user.clerkId,
      email: auth.user.email,
    });

    if (!(await canCreateOrg(auth))) {
      console.error('[API /orgs POST] User lacks permission to create org');
      return unauthorized('You do not have permission to create organizations');
    }

    const { name } = body;
    const orgId = uuid();
    const accessCode = `org_${getRandomChars(16)}`;

    console.log('[API /orgs POST] Creating org:', { orgId, name, accessCode });

    const result = await createOrg(
      {
        id: orgId,
        name,
        access_code: accessCode,
      },
      auth.user.userId,
    );

    // createOrg returns [newOrg, newOrgUser] tuple
    const newOrg = result[0];

    console.log('[API /orgs POST] Org created successfully:', { orgId, name });

    return json(newOrg);
  } catch (err) {
    console.error('[API /orgs POST] Error creating org:', err);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
