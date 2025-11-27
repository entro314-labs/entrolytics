import { Dialog } from '@entro314labs/entro-zen';
import { useMessages } from '@/components/hooks';
import { Edit } from '@/components/icons';
import { ActionButton } from '@/components/input/ActionButton';
import { PixelEditForm } from './PixelEditForm';

export function PixelEditButton({ pixelId }: { pixelId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <ActionButton title={formatMessage(labels.edit)} icon={<Edit />}>
      <Dialog title={formatMessage(labels.pixel)} style={{ width: 600, minHeight: 300 }}>
        {({ close }) => {
          return <PixelEditForm pixelId={pixelId} onClose={close} />;
        }}
      </Dialog>
    </ActionButton>
  );
}
