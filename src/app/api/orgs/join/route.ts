import { z } from "zod";
import { unauthorized, json, badRequest, notFound } from "@/lib/response";
import { canCreateOrg } from "@/validations";
import { parseRequest } from "@/lib/request";
import { ROLES } from "@/lib/constants";
import { createOrgUser, findOrgByAccessCode, getOrgUser } from "@/queries";

export async function POST(request: Request) {
	const schema = z.object({
		accessCode: z.string().max(50),
	});

	const { auth, body, error } = await parseRequest(request, schema);

	if (error) {
		return error();
	}

	if (!(await canCreateOrg(auth))) {
		return unauthorized();
	}

	const { accessCode } = body;

	const org = await findOrgByAccessCode(accessCode);

	if (!org) {
		return notFound("Org not found.");
	}

	const orgUser = await getOrgUser(org.orgId, auth.user.userId);

	if (orgUser) {
		return badRequest("User is already a org member.");
	}

	const user = await createOrgUser(
		auth.user.userId,
		org.orgId,
		ROLES.orgMember,
	);

	return json(user);
}
