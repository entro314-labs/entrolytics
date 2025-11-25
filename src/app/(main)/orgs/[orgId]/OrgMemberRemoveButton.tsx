import { Dialog } from '@entro314labs/entro-zen';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages, useModified } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { ActionButton } from '@/components/input/ActionButton';
import { messages } from '@/components/messages';

export function OrgMemberRemoveButton({
  orgId,
  userId,
  userName,
  onSave,
}: {
  orgId: string;
  userId: string;
  userName: string;
  disabled?: boolean;
  onSave?: () => void;
}) {
  const { formatMessage, labels, getErrorMessage, FormattedMessage } = useMessages();
  const { mutateAsync, isPending, error } = useDeleteQuery(`/orgs/${orgId}/users/${userId}`);
  const { touch } = useModified();

  const handleConfirm = async (close: () => void) => {
    await mutateAsync(null, {
      onSuccess: () => {
        touch('orgs:members');
        onSave?.();
        close();
      },
    });
  };

  return (
    <ActionButton title={formatMessage(labels.delete)} icon={<Trash />}>
      <Dialog title={formatMessage(labels.removeMember)} style={{ width: 400 }}>
        {({ close }) => (
          <ConfirmationForm
            message={
              <FormattedMessage
                {...messages.confirmRemove}
                values={{
                  target: <b>{userName}</b>,
                }}
              />
            }
            isLoading={isPending}
            error={getErrorMessage(error)}
            onConfirm={handleConfirm.bind(null, close)}
            onClose={close}
            buttonLabel={formatMessage(labels.remove)}
            buttonVariant="danger"
          />
        )}
      </Dialog>
    </ActionButton>
  );
}
