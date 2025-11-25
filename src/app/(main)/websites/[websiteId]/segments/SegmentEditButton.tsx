import { Dialog } from '@entro314labs/entro-zen';
import { useMessages } from '@/components/hooks';
import { Edit } from '@/components/icons';
import { ActionButton } from '@/components/input/ActionButton';
import type { Filter } from '@/lib/types';
import { SegmentEditForm } from './SegmentEditForm';

export function SegmentEditButton({
  segmentId,
  websiteId,
  filters,
}: {
  segmentId: string;
  websiteId: string;
  filters?: Filter[];
}) {
  const { formatMessage, labels } = useMessages();

  return (
    <ActionButton title={formatMessage(labels.edit)} icon={<Edit />}>
      <Dialog
        title={formatMessage(labels.segment)}
        style={{ width: 800, height: 'calc(100dvh - 40px)' }}
      >
        {({ close }) => {
          return (
            <SegmentEditForm
              segmentId={segmentId}
              websiteId={websiteId}
              filters={filters}
              onClose={close}
            />
          );
        }}
      </Dialog>
    </ActionButton>
  );
}
