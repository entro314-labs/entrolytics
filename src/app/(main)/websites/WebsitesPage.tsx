"use client";
import { WebsitesDataTable } from "./WebsitesDataTable";
import { WebsiteAddButton } from "./WebsiteAddButton";
import { useMessages, useNavigation } from "@/components/hooks";
import { Column } from "@entro314labs/entro-zen";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel } from "@/components/common/Panel";
import { PageBody } from "@/components/common/PageBody";

export function WebsitesPage() {
	const { orgId } = useNavigation();
	const { formatMessage, labels } = useMessages();

	return (
		<PageBody>
			<Column gap="6" margin="2">
				<PageHeader title={formatMessage(labels.websites)}>
					<WebsiteAddButton orgId={orgId} />
				</PageHeader>
				<Panel>
					<WebsitesDataTable orgId={orgId} />
				</Panel>
			</Column>
		</PageBody>
	);
}
