import { List, ListItem } from '@entro314labs/entro-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useWebsiteSegmentsQuery } from '@/components/hooks';

export interface SegmentFiltersProps {
  websiteId: string;
  segmentId: string;
  type?: string;
  onChange?: (id: string, type: string) => void;
}

export function SegmentFilters({
  websiteId,
  segmentId,
  type = 'segment',
  onChange,
}: SegmentFiltersProps) {
  const { data, isLoading, isFetching } = useWebsiteSegmentsQuery(websiteId, {
    type,
  });

  const handleChange = (id: string) => {
    onChange?.(id, type);
  };

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} overflowY="auto">
      <List selectionMode="single" value={[segmentId]} onChange={id => handleChange(id[0])}>
        {Array.isArray(data?.data) &&
          data.data.map(item => {
            return (
              <ListItem key={item.id} id={item.id}>
                {item.name}
              </ListItem>
            );
          })}
      </List>
    </LoadingPanel>
  );
}
