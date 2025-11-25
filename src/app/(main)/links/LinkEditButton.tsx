import { Dialog } from '@entro314labs/entro-zen';
import { useMessages } from '@/components/hooks';
import { Edit } from '@/components/icons';
import { ActionButton } from '@/components/input/ActionButton';
import { LinkEditForm } from './LinkEditForm';

export function LinkEditButton({ linkId }: { linkId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <ActionButton title={formatMessage(labels.edit)} icon={<Edit />}>
      <Dialog title={formatMessage(labels.link)} style={{ width: 800, minHeight: 300 }}>
        {({ close }) => {
          return <LinkEditForm linkId={linkId} onClose={close} />;
        }}
      </Dialog>
    </ActionButton>
  );
}
