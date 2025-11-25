import { Dialog } from '@entro314labs/entro-zen';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { ActionButton } from '@/components/input/ActionButton';
import { messages } from '@/components/messages';

export function BoardDeleteButton({
  boardId,
  name,
  onSave,
}: {
  boardId: string;
  name: string;
  onSave?: () => void;
}) {
  const { formatMessage, labels, getErrorMessage, FormattedMessage } = useMessages();
  const { mutateAsync, isPending, error, touch } = useDeleteQuery(`/boards/${boardId}`);

  const handleConfirm = async (close: () => void) => {
    await mutateAsync(null, {
      onSuccess: () => {
        touch('boards');
        onSave?.();
        close();
      },
    });
  };

  return (
    <ActionButton title={formatMessage(labels.delete)} icon={<Trash />}>
      <Dialog title={formatMessage(labels.confirm)} style={{ width: 400 }}>
        {({ close }) => (
          <ConfirmationForm
            message={
              <FormattedMessage
                {...messages.confirmRemove}
                values={{
                  target: <b>{name}</b>,
                }}
              />
            }
            isLoading={isPending}
            error={getErrorMessage(error)}
            onConfirm={handleConfirm.bind(null, close)}
            onClose={close}
            buttonLabel={formatMessage(labels.delete)}
            buttonVariant="danger"
          />
        )}
      </Dialog>
    </ActionButton>
  );
}
