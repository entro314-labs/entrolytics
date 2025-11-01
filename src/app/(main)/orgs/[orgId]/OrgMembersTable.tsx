import { DataColumn, DataTable, Row } from "@entro314labs/entro-zen";
import { useMessages } from "@/components/hooks";
import { ROLES } from "@/lib/constants";
import { OrgMemberRemoveButton } from "./OrgMemberRemoveButton";
import { OrgMemberEditButton } from "./OrgMemberEditButton";

export function OrgMembersTable({
	data = [],
	orgId,
	allowEdit = false,
}: {
	data: any[];
	orgId: string;
	allowEdit: boolean;
}) {
	const { formatMessage, labels } = useMessages();

	const roles = {
		[ROLES.orgOwner]: formatMessage(labels.orgOwner),
		[ROLES.orgManager]: formatMessage(labels.orgManager),
		[ROLES.orgMember]: formatMessage(labels.orgMember),
		[ROLES.orgViewOnly]: formatMessage(labels.viewOnly),
	};

	// Ensure data is valid and has required fields
	const safeData = Array.isArray(data)
		? data
				.filter((item) => item && (item.userId || item.user?.userId || item.id))
				.map((item, index) => ({
					...item,
					userId:
						item.userId || item.user?.userId || item.id || `fallback-${index}`,
				}))
		: [];

	return (
		<DataTable
			data={safeData}
			rowKey={(row, index) => row.userId || row.user?.userId || `row-${index}`}
		>
			<DataColumn id="name" label={formatMessage(labels.name)}>
				{(row: any) => row?.user?.displayName || row?.user?.email}
			</DataColumn>
			<DataColumn id="role" label={formatMessage(labels.role)}>
				{(row: any) => roles[row?.role]}
			</DataColumn>
			{allowEdit && (
				<DataColumn id="action" align="end">
					{(row: any) => {
						if (row?.role === ROLES.orgOwner) {
							return null;
						}

						return (
							<Row alignItems="center">
								<OrgMemberEditButton
									orgId={orgId}
									userId={row?.user?.userId}
									role={row?.role}
								/>
								<OrgMemberRemoveButton
									orgId={orgId}
									userId={row?.user?.userId}
									userName={row?.user?.displayName || row?.user?.email}
								/>
							</Row>
						);
					}}
				</DataColumn>
			)}
		</DataTable>
	);
}
