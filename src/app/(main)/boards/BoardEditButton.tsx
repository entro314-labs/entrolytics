import { Dialog } from '@entro314labs/entro-zen';
import { useMessages } from '@/components/hooks';
import { Edit } from '@/components/icons';
import { ActionButton } from '@/components/input/ActionButton';
import { BoardAddForm } from './BoardAddForm';

export function BoardEditButton({ boardId }: { boardId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <ActionButton title={formatMessage(labels.edit)} icon={<Edit />}>
      <Dialog title={formatMessage(labels.board)} style={{ width: 600, minHeight: 200 }}>
        {({ close }) => {
          return <BoardAddForm boardId={boardId} onClose={close} />;
        }}
      </Dialog>
    </ActionButton>
  );
}
