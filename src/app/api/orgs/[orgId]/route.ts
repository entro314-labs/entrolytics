import { z } from "zod";
import { unauthorized, json, notFound, ok, badRequest } from "@/lib/response";
import { canDeleteOrg, canUpdateOrg, canViewOrg } from "@/validations";
import { parseRequest } from "@/lib/request";
import { deleteOrg, getOrg, updateOrg } from "@/queries";
import { isValidUuid } from "@/lib/uuid";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ orgId: string }> },
) {
	const { auth, error } = await parseRequest(request);

	if (error) {
		return error();
	}

	const { orgId } = await params;

	// Validate orgId is a proper UUID
	if (!isValidUuid(orgId)) {
		return badRequest("Invalid organization ID format");
	}

	if (!(await canViewOrg(auth, orgId))) {
		return unauthorized();
	}

	const org = await getOrg(orgId, { includeMembers: true });

	if (!org) {
		return notFound("Org not found.");
	}

	return json(org);
}

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ orgId: string }> },
) {
	const schema = z.object({
		name: z.string().max(50).optional(),
		accessCode: z.string().max(50).optional(),
	});

	const { auth, body, error } = await parseRequest(request, schema);

	if (error) {
		return error();
	}

	const { orgId } = await params;

	// Validate orgId is a proper UUID
	if (!isValidUuid(orgId)) {
		return badRequest("Invalid organization ID format");
	}

	if (!(await canUpdateOrg(auth, orgId))) {
		return unauthorized("You must be the owner of this org.");
	}

	const org = await updateOrg(orgId, {
		...body,
		access_code: body.accessCode,
	});

	return json(org);
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ orgId: string }> },
) {
	const { auth, error } = await parseRequest(request);

	if (error) {
		return error();
	}

	const { orgId } = await params;

	// Validate orgId is a proper UUID
	if (!isValidUuid(orgId)) {
		return badRequest("Invalid organization ID format");
	}

	if (!(await canDeleteOrg(auth, orgId))) {
		return unauthorized("You must be the owner of this org.");
	}

	await deleteOrg(orgId);

	return ok();
}
