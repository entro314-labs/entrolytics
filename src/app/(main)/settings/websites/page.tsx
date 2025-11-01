import { Metadata } from "next";
import { WebsitesSettingsPage } from "./WebsitesSettingsPage";

export default async function ({
	params,
}: {
	params: Promise<{ orgId: string }>;
}) {
	const { orgId } = await params;

	return <WebsitesSettingsPage orgId={orgId} />;
}

export const metadata: Metadata = {
	title: "Websites",
};
