import { ReactNode } from "react";
import { Loading, Column, type ColumnProps } from "@entro314labs/entro-zen";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Empty } from "@/components/common/Empty";

export interface LoadingPanelProps extends ColumnProps {
	data?: any;
	error?: Error;
	isEmpty?: boolean;
	isLoading?: boolean;
	isFetching?: boolean;
	loadingIcon?: "dots" | "spinner";
	loadingPosition?: "center" | "page" | "inline";
	renderEmpty?: () => ReactNode;
	children: ReactNode;
}

export function LoadingPanel({
	data,
	error,
	isEmpty,
	isLoading,
	isFetching,
	loadingIcon = "dots",
	loadingPosition = "page",
	renderEmpty = () => <Empty />,
	children,
	...props
}: LoadingPanelProps) {
	const empty = isEmpty ?? checkEmpty(data);

	// Defensive guard: if data becomes null/undefined while not loading, keep showing loading
	const isActuallyLoading = isLoading || isFetching || (!data && !error);

	return (
		<>
			{/* Show loading spinner */}
			{isActuallyLoading && (
				<Column position="relative" height="100%" {...props}>
					<Loading icon={loadingIcon} position={loadingPosition} />
				</Column>
			)}

			{/* Show error */}
			{error && <ErrorMessage />}

			{/* Show empty state (once loaded) */}
			{!error && !isActuallyLoading && empty && renderEmpty()}

			{/* Show main content when data exists and stable */}
			{!isActuallyLoading && !error && !empty && data && children}
		</>
	);
}

function checkEmpty(data: any) {
	if (!data) return true;

	// Handle PageResult objects (has data array and pagination info)
	if (typeof data === "object" && "data" in data && Array.isArray(data.data)) {
		return data.data.length <= 0;
	}

	if (Array.isArray(data)) {
		return data.length <= 0;
	}

	if (typeof data === "object") {
		return Object.keys(data).length <= 0;
	}

	return !data;
}
