import { Column, Grid, Row, Text } from '@entro314labs/entro-zen';
import { config, useSpring } from '@react-spring/web';
import React, { type ReactNode } from 'react';
import * as ReactWindow from 'react-window';
import { AnimatedDiv } from '@/components/common/AnimatedDiv';
import { Empty } from '@/components/common/Empty';
import { useMessages, useMobile } from '@/components/hooks';
import { formatLongCurrency, formatLongNumber } from '@/lib/format';

const ITEM_SIZE = 30;

interface ListData {
  label: string;
  count: number;
  percent: number;
}

export interface ListTableProps {
  data?: ListData[];
  title?: string;
  metric?: string;
  className?: string;
  renderLabel?: (data: ListData, index: number) => ReactNode;
  renderChange?: (data: ListData, index: number) => ReactNode;
  animate?: boolean;
  virtualize?: boolean;
  showPercentage?: boolean;
  itemCount?: number;
  currency?: string;
}

export function ListTable({
  data = [],
  title,
  metric,
  renderLabel,
  renderChange,
  animate = true,
  virtualize = false,
  showPercentage = true,
  itemCount = 10,
  currency,
}: ListTableProps) {
  const { formatMessage, labels } = useMessages();
  const { isPhone } = useMobile();

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  const getRow = (row: ListData, index: number) => {
    const { label, count, percent } = row;

    // Generate a more robust key that handles edge cases
    const safeLabel = typeof label === 'string' ? label : String(label || 'unknown');
    const keyId = `row-${index}-${safeLabel.slice(0, 50)}-${count || 0}`;

    return (
      <AnimatedRow
        key={keyId}
        label={renderLabel ? renderLabel(row, index) : safeLabel || formatMessage(labels.unknown)}
        value={count}
        percent={percent}
        animate={animate && !virtualize}
        showPercentage={showPercentage}
        change={renderChange ? renderChange(row, index) : null}
        currency={currency}
        isMobile={isPhone}
      />
    );
  };

  const ListTableRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const rowData = safeData[index];
    const safeLabel =
      typeof rowData?.label === 'string' ? rowData.label : String(rowData?.label || 'unknown');
    const virtualizedKey = `virtualized-${index}-${safeLabel.slice(0, 30)}-${rowData?.count || 0}`;

    return (
      <div style={style} key={virtualizedKey}>
        {getRow(rowData, index)}
      </div>
    );
  };

  return (
    <Column gap>
      <Grid alignItems="center" justifyContent="space-between" paddingLeft="2" columns="1fr 100px">
        <Text weight="bold">{title}</Text>
        <Text weight="bold" align="center">
          {metric}
        </Text>
      </Grid>
      <Column gap="1">
        {safeData?.length === 0 && <Empty />}
        {virtualize && safeData.length > 0
          ? React.createElement(ReactWindow.List as any, {
              width: '100%',
              height: itemCount * ITEM_SIZE,
              itemCount: safeData.length,
              itemSize: ITEM_SIZE,
              children: ListTableRow,
            })
          : safeData.map(getRow)}
      </Column>
    </Column>
  );
}

const AnimatedRow = ({
  label,
  value = 0,
  percent,
  change,
  animate,
  showPercentage = true,
  currency,
  isMobile,
}) => {
  const props = useSpring({
    width: percent,
    y: !isNaN(value) ? value : 0,
    from: { width: 0, y: 0 },
    config: animate ? config.default : { duration: 0 },
  });

  return (
    <Grid
      columns="1fr 50px 50px"
      paddingLeft="2"
      alignItems="center"
      hoverBackgroundColor="2"
      borderRadius
      gap
    >
      <Row alignItems="center">
        <Text truncate={true} style={{ maxWidth: isMobile ? '200px' : '400px' }}>
          {label}
        </Text>
      </Row>
      <Row alignItems="center" height="30px" justifyContent="flex-end">
        {change}
        <Text weight="bold">
          <AnimatedDiv title={props?.y as any}>
            {currency
              ? props.y?.to(n => formatLongCurrency(n, currency))
              : props.y?.to(formatLongNumber)}
          </AnimatedDiv>
        </Text>
      </Row>
      {showPercentage && (
        <Row
          alignItems="center"
          justifyContent="flex-start"
          position="relative"
          border="left"
          borderColor="8"
          color="muted"
          paddingLeft="3"
        >
          <AnimatedDiv>{props.width.to(n => `${n?.toFixed?.(0)}%`)}</AnimatedDiv>
        </Row>
      )}
    </Grid>
  );
};
