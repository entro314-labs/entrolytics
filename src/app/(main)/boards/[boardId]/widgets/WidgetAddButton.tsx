'use client';
import { Button, Dialog, DialogTrigger, Icon, Modal, Text } from '@entro314labs/entro-zen';
import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { WidgetAddForm } from './WidgetAddForm';

export function WidgetAddButton({ boardId }: { boardId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.addWidget)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.addWidget)} style={{ width: 500 }}>
          {({ close }) => <WidgetAddForm boardId={boardId} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
