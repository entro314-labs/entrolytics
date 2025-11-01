"use client";
import { OrgMembersDataTable } from "./OrgMembersDataTable";
import { SectionHeader } from "@/components/common/SectionHeader";
import { useLoginQuery, useMessages, useOrg } from "@/components/hooks";
import { ROLES } from "@/lib/constants";
import { Column } from "@entro314labs/entro-zen";

export function OrgMembersPage({ orgId }: { orgId: string }) {
	const org = useOrg();
	const { user } = useLoginQuery();
	const { formatMessage, labels } = useMessages();

	const canEdit =
		org?.members?.find(
			({ userId, role }) =>
				(role === ROLES.orgOwner || role === ROLES.orgManager) &&
				userId === user.id,
		) && user.role !== ROLES.viewOnly;

	return (
		<Column gap>
			<SectionHeader title={formatMessage(labels.members)} />
			<OrgMembersDataTable orgId={orgId} allowEdit={canEdit} />
		</Column>
	);
}
