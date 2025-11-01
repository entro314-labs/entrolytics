import { WebsitesTable } from "./WebsitesTable";
import { DataGrid } from "@/components/common/DataGrid";
import { TableErrorBoundary } from "@/components/common/TableErrorBoundary";
import { useUserWebsitesQuery } from "@/components/hooks";

export function WebsitesDataTable({
	orgId,
	allowEdit = true,
	allowView = true,
	showActions = true,
}: {
	orgId?: string;
	allowEdit?: boolean;
	allowView?: boolean;
	showActions?: boolean;
}) {
	const queryResult = useUserWebsitesQuery({ orgId });

	return (
		<DataGrid query={queryResult} allowSearch allowPaging>
			{(result) => {
				try {
					// PageResult contains data in the 'data' property
					const websitesData = result?.data;

					// Ensure we always pass a valid array to WebsitesTable
					const safeWebsitesData = Array.isArray(websitesData)
						? websitesData
						: [];

					return (
						<TableErrorBoundary>
							<WebsitesTable
								orgId={orgId}
								data={safeWebsitesData}
								showActions={showActions}
								allowEdit={allowEdit}
								allowView={allowView}
							/>
						</TableErrorBoundary>
					);
				} catch (error) {
					console.error("Error rendering WebsitesTable:", error);
					return <div>Error loading websites. Please try again.</div>;
				}
			}}
		</DataGrid>
	);
}
