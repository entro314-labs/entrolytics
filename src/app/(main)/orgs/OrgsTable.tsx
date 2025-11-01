import {
	DataColumn,
	DataTable,
	Icon,
	MenuItem,
	Text,
	Row,
} from "@entro314labs/entro-zen";
import { useMessages, useNavigation } from "@/components/hooks";
import { Eye, Edit } from "@/components/icons";
import { ROLES } from "@/lib/constants";
import { MenuButton } from "@/components/input/MenuButton";
import Link from "next/link";

export function OrgsTable({
	data = [],
	showActions = false,
}: {
	data: any[];
	allowEdit?: boolean;
	showActions?: boolean;
}) {
	const { formatMessage, labels } = useMessages();
	const { renderUrl } = useNavigation();

	// Ensure data is valid and has required fields
	const safeData = Array.isArray(data)
		? data
				.filter((item) => item && (item.orgId || item.id))
				.map((item, index) => ({
					...item,
					orgId: item.orgId || item.id || `fallback-${index}`,
				}))
		: [];

	return (
		<DataTable
			data={safeData}
			rowKey={(row, index) => row.orgId || `row-${index}`}
		>
			<DataColumn id="name" label={formatMessage(labels.name)}>
				{(row: any) => (
					<Link href={renderUrl(`/settings/orgs/${row.orgId}`)}>
						{row.name}
					</Link>
				)}
			</DataColumn>
			<DataColumn id="owner" label={formatMessage(labels.owner)}>
				{(row: any) =>
					Array.isArray(row?.members)
						? row.members.find(({ role }) => role === ROLES.orgOwner)?.user
								?.username
						: null
				}
			</DataColumn>
			<DataColumn
				id="websites"
				label={formatMessage(labels.websites)}
				align="end"
			>
				{(row: any) => row?._count?.websites}
			</DataColumn>
			<DataColumn
				id="members"
				label={formatMessage(labels.members)}
				align="end"
			>
				{(row: any) => row?._count?.members}
			</DataColumn>
			{showActions ? (
				<DataColumn id="action" label=" " align="end">
					{(row: any) => {
						const { orgId } = row;

						return (
						<MenuButton>
							<MenuItem id={`view-${orgId}`} href={`/orgs/${orgId}`}>
								<Row alignItems="center" gap>
									<Icon>
										<Eye />
									</Icon>
									<Text>{formatMessage(labels.view)}</Text>
									</Row>
								</MenuItem>
							<MenuItem
								id={`edit-${orgId}`}
								href={`/settings/orgs/${orgId}`}
							>
									<Row alignItems="center" gap>
										<Icon>
											<Edit />
										</Icon>
										<Text>{formatMessage(labels.edit)}</Text>
									</Row>
								</MenuItem>
							</MenuButton>
						);
					}}
				</DataColumn>
			) : null}
		</DataTable>
	);
}
