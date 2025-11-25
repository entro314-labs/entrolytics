import { Column, Row, SearchField } from '@entro314labs/entro-zen';
import type { UseQueryResult } from '@tanstack/react-query';
import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useState,
} from 'react';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Pager } from '@/components/common/Pager';
import { TableErrorBoundary } from '@/components/common/TableErrorBoundary';
import { useMessages, useMobile, useNavigation } from '@/components/hooks';
import type { PageResult } from '@/lib/types';

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
  const [search, setSearch] = useState(queryParams?.search || data?.search || '');
  const { isMobile } = useMobile();
  const displayMode = isMobile ? 'cards' : undefined;

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
            style={{ width: '280px' }}
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
              {(() => {
                const child = typeof children === 'function' ? children(data) : children;
                return isValidElement(child)
                  ? cloneElement(child as ReactElement<any>, { displayMode })
                  : child;
              })()}
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
