import { Button, Dialog, DialogTrigger, Icon, Modal, Text } from '@entro314labs/entro-zen';
import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { BoardAddForm } from './BoardAddForm';

export function BoardAddButton({ orgId }: { orgId?: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button data-test="button-board-add" variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.addBoard)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.addBoard)} style={{ width: 500 }}>
          {({ close }) => <BoardAddForm orgId={orgId} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
