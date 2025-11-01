import { AdminOrgPage } from "./AdminOrgPage";
import { Metadata } from "next";

export default async function ({
	params,
}: {
	params: Promise<{ orgId: string }>;
}) {
	const { orgId } = await params;

	return <AdminOrgPage orgId={orgId} />;
}

export const metadata: Metadata = {
	title: "Org",
};
