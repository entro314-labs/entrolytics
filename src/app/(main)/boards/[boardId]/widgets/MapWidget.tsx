'use client';
import { WorldMap } from '@/components/metrics/WorldMap';

export interface MapWidgetProps {
  websiteId: string;
}

export function MapWidget({ websiteId }: MapWidgetProps) {
  return <WorldMap websiteId={websiteId} />;
}
