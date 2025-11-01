import { useState } from "react";
import {
	Row,
	Text,
	Icon,
	DataTable,
	DataColumn,
	MenuItem,
	Modal,
} from "@entro314labs/entro-zen";
import Link from "next/link";
import { ROLES } from "@/lib/constants";
import { Trash } from "@/components/icons";
import { useMessages } from "@/components/hooks";
import { Edit } from "@/components/icons";
import { MenuButton } from "@/components/input/MenuButton";
import { UserDeleteForm } from "./UserDeleteForm";
import { DateDistance } from "@/components/common/DateDistance";

export function UsersTable({
	data = [],
	showActions = true,
}: {
	data: any[];
	showActions?: boolean;
}) {
	const { formatMessage, labels } = useMessages();
	const [deleteUser, setDeleteUser] = useState(null);

	// Ensure data is valid and has required fields
	const safeData = Array.isArray(data)
		? data
				.filter((item) => item && (item.userId || item.id))
				.map((item, index) => ({
					...item,
					userId: item.userId || item.id || `fallback-${index}`,
				}))
		: [];

	return (
		<>
			<DataTable
				data={safeData}
				rowKey={(row, index) => row.userId || `row-${index}`}
			>
				<DataColumn
					id="displayName"
					label={formatMessage(labels.name)}
					width="2fr"
				>
					{(row: any) => (
						<Link href={`/admin/users/${row.userId}`}>
							{row.displayName || row.email || "Unknown User"}
						</Link>
					)}
				</DataColumn>
				<DataColumn id="email" label={formatMessage(labels.email)} width="2fr">
					{(row: any) => row.email}
				</DataColumn>
				<DataColumn id="role" label={formatMessage(labels.role)}>
					{(row: any) =>
						formatMessage(
							labels[
								Object.keys(ROLES).find((key) => ROLES[key] === row.role)
							] || labels.unknown,
						)
					}
				</DataColumn>
				<DataColumn
					id="websiteCount"
					label={formatMessage(labels.websites)}
					align="center"
				>
					{(row: any) => row.websiteCount || 0}
				</DataColumn>
				<DataColumn id="created" label={formatMessage(labels.created)}>
					{(row: any) => <DateDistance date={new Date(row.createdAt)} />}
				</DataColumn>
				{showActions && (
					<DataColumn id="action" align="end" width="100px">
						{(row: any) => {
							const { userId } = row;

							return (
						<MenuButton>
							<MenuItem
								id={`edit-${userId}`}
								href={`/admin/users/${userId}`}
								data-test="link-button-edit"
							>
										<Row alignItems="center" gap>
											<Icon>
												<Edit />
											</Icon>
											<Text>{formatMessage(labels.edit)}</Text>
										</Row>
									</MenuItem>
									<MenuItem
										id="delete"
										onAction={() => setDeleteUser(row)}
										data-test="link-button-delete"
									>
										<Row alignItems="center" gap>
											<Icon>
												<Trash />
											</Icon>
											<Text>{formatMessage(labels.delete)}</Text>
										</Row>
									</MenuItem>
								</MenuButton>
							);
						}}
					</DataColumn>
				)}
			</DataTable>
			<Modal isOpen={!!deleteUser}>
				<UserDeleteForm
					userId={deleteUser?.userId}
					displayName={deleteUser?.displayName || deleteUser?.email}
					onClose={() => {
						setDeleteUser(null);
					}}
				/>
			</Modal>
		</>
	);
}
