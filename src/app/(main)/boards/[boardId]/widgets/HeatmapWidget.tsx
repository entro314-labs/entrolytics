'use client';
import { WeeklyTraffic } from '@/components/metrics/WeeklyTraffic';

export interface HeatmapWidgetProps {
  websiteId: string;
}

export function HeatmapWidget({ websiteId }: HeatmapWidgetProps) {
  return <WeeklyTraffic websiteId={websiteId} />;
}
