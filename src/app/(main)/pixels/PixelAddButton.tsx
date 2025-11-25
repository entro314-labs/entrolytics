import { Button, Dialog, DialogTrigger, Icon, Modal, Text } from '@entro314labs/entro-zen';
import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { PixelEditForm } from './PixelEditForm';

export function PixelAddButton({ orgId }: { orgId?: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button data-test="button-website-add" variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.addPixel)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.addPixel)} style={{ width: 600 }}>
          {({ close }) => <PixelEditForm orgId={orgId} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
