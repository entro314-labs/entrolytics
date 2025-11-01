import { z } from "zod";
import { getQueryFilters, parseRequest } from "@/lib/request";
import { unauthorized, json, serverError } from "@/lib/response";
import { canViewWebsite } from "@/validations";
import {
	dateRangeParams,
	pagingParams,
	filterParams,
	searchParams,
} from "@/lib/schema";
import { getWebsiteEvents } from "@/queries";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ websiteId: string }> },
) {
	console.log('[events] GET request started');
	try {
		const schema = z.object({
			...dateRangeParams,
			...filterParams,
			...pagingParams,
			...searchParams,
		});

		const { auth, query, error } = await parseRequest(request, schema);

	if (error) {
		return error();
	}

	const { websiteId } = await params;

	if (!(await canViewWebsite(auth, websiteId))) {
		return unauthorized();
	}

	try {
		const filters = await getQueryFilters(query, websiteId);
		const data = await getWebsiteEvents(websiteId, filters);
		return json(data);
	} catch (err) {
		const error = err as Error;
		console.error('[API Error] /api/websites/[websiteId]/events:', {
			websiteId,
			query,
			error: error.message,
			stack: error.stack,
		});
		return serverError({ message: error.message, stack: error.stack });
	}
	} catch (err) {
		const error = err as Error;
		console.error('[FATAL] Unhandled error in events route:', error);
		return serverError({ message: error.message, stack: error.stack });
	}
}
