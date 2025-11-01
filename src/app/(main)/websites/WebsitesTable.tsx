import { ReactNode } from "react";
import {
	Row,
	Text,
	Icon,
	DataTable,
	DataColumn,
	MenuItem,
} from "@entro314labs/entro-zen";
import { useMessages, useNavigation } from "@/components/hooks";
import { MenuButton } from "@/components/input/MenuButton";
import { Eye, SquarePen } from "@/components/icons";
import { TableErrorBoundary } from "@/components/common/TableErrorBoundary";
import Link from "next/link";

export interface WebsitesTableProps {
	data: Record<string, any>[];
	showActions?: boolean;
	allowEdit?: boolean;
	allowView?: boolean;
	orgId?: string;
	children?: ReactNode;
}

export function WebsitesTable({
	data = [],
	showActions,
	allowEdit,
	allowView,
	children,
}: WebsitesTableProps) {
	const { formatMessage, labels } = useMessages();
	const { renderUrl, pathname } = useNavigation();
	const isSettings = pathname.includes("/settings");

	// Defensive guards
	if (!data || !Array.isArray(data) || data.length === 0) {
		return children || null;
	}

	// Additional safety check for data integrity
	const safeData = data.filter((item) => {
		if (!item) return false;

		// Check for expected website identifier fields
		const hasId = item.websiteId || item.id || item.website_id;
		return hasId;
	});

	if (safeData.length === 0) {
		return children || null;
	}

	return (
		<TableErrorBoundary>
			<DataTable
				data={safeData}
				rowKey={(row: any, index: number) => {
					// Try multiple possible ID fields for compatibility
					const id = row.websiteId || row.id || row.website_id;
					if (!id) {
						return `fallback-${index}-${row.name || row.domain || "unknown"}`;
					}
					return id;
				}}
			>
				<DataColumn id="name" label={formatMessage(labels.name)}>
					{(row: any) => {
						// Handle multiple possible ID fields for compatibility
						const websiteId = row.websiteId || row.id || row.website_id;
						const name = row.displayName || row.name;

						if (!websiteId) {
							return <span>{name || "Unknown Website"}</span>;
						}

						return (
							<Link
								href={renderUrl(
									`${isSettings ? "/settings" : ""}/websites/${websiteId}`,
									false,
								)}
							>
								{name || "Unnamed Website"}
							</Link>
						);
					}}
				</DataColumn>
				<DataColumn id="domain" label={formatMessage(labels.domain)}>
					{(row: any) => {
						return row.domain || "No domain";
					}}
				</DataColumn>
				{showActions && (
					<DataColumn id="action" label=" " align="end">
						{(row: any) => {
							// Handle multiple possible ID fields for compatibility
							const websiteId = row.websiteId || row.id || row.website_id;

							if (!websiteId) {
								return null;
							}

							return (
							<MenuButton>
								{allowView && (
									<MenuItem
										id={`view-${websiteId}`}
										href={renderUrl(`/websites/${websiteId}`)}
									>
										<Row alignItems="center" gap>
											<Icon data-test="link-button-view">
												<Eye />
											</Icon>
											<Text>{formatMessage(labels.view)}</Text>
											</Row>
										</MenuItem>
								)}
								{allowEdit && (
									<MenuItem
										id={`edit-${websiteId}`}
										href={renderUrl(`/websites/${websiteId}/settings`)}
									>
										<Row alignItems="center" gap>
											<Icon data-test="link-button-edit">
												<SquarePen />
											</Icon>
											<Text>{formatMessage(labels.edit)}</Text>
											</Row>
										</MenuItem>
									)}
								</MenuButton>
							);
						}}
					</DataColumn>
				)}
			</DataTable>
		</TableErrorBoundary>
	);
}
