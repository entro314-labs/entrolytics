import { z } from "zod";
import {
	canCreateOrgWebsite,
	canCreateWebsite,
	canViewAllWebsites,
} from "@/validations";
import { json, unauthorized } from "@/lib/response";
import { uuid } from "@/lib/crypto";
import { parseRequest, getQueryFilters } from "@/lib/request";
import { createWebsite, getWebsites, getUserWebsites } from "@/queries";
import { pagingParams, searchParams } from "@/lib/schema";

export async function GET(request: Request) {
	console.log("🔍 /api/websites called");
	const schema = z.object({
		...pagingParams,
		...searchParams,
	});

	const { auth, query, error } = await parseRequest(request, schema);

	console.log("🔍 Websites auth check result:", {
		hasAuth: !!auth,
		hasUser: !!auth?.user,
		clerkUserId: auth?.clerkUserId,
		userId: auth?.user?.userId,
		error: error ? "YES" : "NO",
	});

	if (error) {
		console.log("🚨 /api/websites returning error");
		return error();
	}

	const filters = await getQueryFilters(query);
	console.log("🔍 Query filters:", filters);

	// If user is admin, return all websites, otherwise return user's websites
	if (await canViewAllWebsites(auth)) {
		console.log("✅ User can view all websites (admin)");
		const websites = await getWebsites({}, filters);
		console.log("✅ Returning all websites:", {
			count: websites?.data?.length || 0,
			firstWebsite: websites?.data?.[0] ? Object.keys(websites.data[0]) : [],
		});
		return json(websites);
	} else {
		console.log("✅ Getting user websites for userId:", auth?.user?.userId);
		const websites = await getUserWebsites(auth?.user?.userId, filters);
		console.log("✅ Returning user websites:", {
			count: websites?.data?.length || 0,
			firstWebsite: websites?.data?.[0] ? Object.keys(websites.data[0]) : [],
		});
		return json(websites);
	}
}

export async function POST(request: Request) {
	const schema = z.object({
		name: z.string().max(100),
		domain: z.string().max(500),
		shareId: z.string().max(50).nullable().optional(),
		orgId: z.string().nullable().optional(),
		id: z.string().uuid().nullable().optional(),
	});

	const { auth, body, error } = await parseRequest(request, schema);

	if (error) {
		return error();
	}

	const { id, name, domain, shareId, orgId } = body;

	if (
		(orgId && !(await canCreateOrgWebsite(auth, orgId))) ||
		!(await canCreateWebsite(auth))
	) {
		return unauthorized();
	}

	const data: any = {
		website_id: id ?? uuid(),
		created_by: auth.user.userId,
		name,
		domain,
		share_id: shareId,
		org_id: orgId,
	};

	if (!orgId) {
		data.user_id = auth.user.userId;
	}

	const website = await createWebsite(data);

	return json(website);
}
