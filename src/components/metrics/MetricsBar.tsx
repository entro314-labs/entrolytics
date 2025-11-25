import { Grid, type GridProps } from '@entro314labs/entro-zen';
import type { ReactNode } from 'react';

export interface MetricsBarProps extends GridProps {
  children?: ReactNode;
}

export function MetricsBar({ children, ...props }: MetricsBarProps) {
  return (
    <Grid columns="repeat(auto-fit, minmax(140px, 1fr))" gap {...props}>
      {children}
    </Grid>
  );
}
