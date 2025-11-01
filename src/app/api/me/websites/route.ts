import { z } from "zod";
import { pagingParams } from "@/lib/schema";
import { getUserWebsites } from "@/queries";
import { json } from "@/lib/response";
import { parseRequest, getQueryFilters } from "@/lib/request";

export async function GET(request: Request) {
	const schema = z.object({
		...pagingParams,
	});

	const { auth, query, error } = await parseRequest(request, schema);

	if (error) {
		return error();
	}

	if (!auth.user) {
		return new Response(
			JSON.stringify({ error: "User not found in database" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	const filters = await getQueryFilters(query);

	const websites = await getUserWebsites(auth.user.userId, filters);

	return json(websites);
}
