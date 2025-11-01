import { ReactNode, useState, useCallback } from "react";
import { SearchField, Row, Column } from "@entro314labs/entro-zen";
import { UseQueryResult } from "@tanstack/react-query";
import { useMessages, useNavigation } from "@/components/hooks";
import { Pager } from "@/components/common/Pager";
import { LoadingPanel } from "@/components/common/LoadingPanel";
import { TableErrorBoundary } from "@/components/common/TableErrorBoundary";
import { PageResult } from "@/lib/types";
import { Empty } from "@/components/common/Empty";

const DEFAULT_SEARCH_DELAY = 300;

export interface DataGridProps {
	query: UseQueryResult<PageResult<any>, any>;
	searchDelay?: number;
	allowSearch?: boolean;
	allowPaging?: boolean;
	autoFocus?: boolean;
	renderActions?: () => ReactNode;
	renderEmpty?: () => ReactNode;
	children: ReactNode | ((data: any) => ReactNode);
}

export function DataGrid({
	query,
	searchDelay = DEFAULT_SEARCH_DELAY,
	allowSearch,
	allowPaging = true,
	autoFocus,
	renderActions,
	renderEmpty = () => <Empty />,
	children,
}: DataGridProps) {
	const { formatMessage, labels } = useMessages();
	const { data, error, isLoading, isFetching } = query;
	const { router, updateParams, query: queryParams } = useNavigation();
	const [search, setSearch] = useState(
		queryParams?.search || data?.search || "",
	)

	const handleSearch = (value: string) => {
		if (value !== search) {
			setSearch(value);
			router.push(updateParams({ search: value, page: 1 }));
		}
	};

	const handlePageChange = useCallback(
		(page: number) => {
			router.push(updateParams({ search, page }));
		},
		[search],
	);

	return (
		<Column gap="4" minHeight="300px">
			{allowSearch && (
				<Row alignItems="center" justifyContent="space-between">
					<SearchField
						value={search}
						onSearch={handleSearch}
						delay={searchDelay || DEFAULT_SEARCH_DELAY}
						autoFocus={autoFocus}
						placeholder={formatMessage(labels.search)}
						aria-label={formatMessage(labels.search)}
						style={{ width: "280px" }}
					/>
					{renderActions?.()}
				</Row>
			)}
			<LoadingPanel
				data={data}
				isLoading={isLoading}
				isFetching={isFetching}
				error={error}
				renderEmpty={renderEmpty}
			>
				{data && (
					<TableErrorBoundary>
						<Column>
							{typeof children === "function" ? children(data) : children}
						</Column>
						{allowPaging && data && (
							<Row marginTop="6">
								<Pager
									page={data.page}
									pageSize={data.pageSize}
									count={data.count}
									onPageChange={handlePageChange}
								/>
							</Row>
						)}
					</TableErrorBoundary>
				)}
			</LoadingPanel>
		</Column>
	);
}
