import { parseRequest } from "@/lib/request";
import { json } from "@/lib/response";

/**
 * Get Current User Information
 *
 * Returns the authenticated user's profile data.
 * This endpoint now works with Clerk authentication instead of JWT tokens.
 */
export async function GET(request: Request) {
	console.log("🔍 /api/me called");
	const { auth, error } = await parseRequest(request);

	console.log("🔍 Auth check result:", {
		hasAuth: !!auth,
		hasUser: !!auth?.user,
		clerkUserId: auth?.clerkUserId,
		userId: auth?.user?.userId,
		error: error ? "YES" : "NO",
	});

	if (error) {
		console.log("🚨 /api/me returning error");
		return error();
	}

	const response = {
		user: auth.user,
		clerkUserId: auth.clerkUserId,
		orgId: auth.orgId,
	};

	console.log("✅ /api/me returning user data:", {
		hasUser: !!response.user,
		userFields: response.user ? Object.keys(response.user) : [],
		clerkUserId: response.clerkUserId,
	});

	return json(response);
}
