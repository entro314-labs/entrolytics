import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery, useMessages, useModified } from '@/components/hooks';

export function OrgLeaveForm({
  orgId,
  userId,
  orgName,
  onSave,
  onClose,
}: {
  orgId: string;
  userId: string;
  orgName: string;
  onSave: () => void;
  onClose: () => void;
}) {
  const { formatMessage, labels, messages, getErrorMessage, FormattedMessage } = useMessages();
  const { mutateAsync, error, isPending } = useDeleteQuery(`/orgs/${orgId}/users/${userId}`);
  const { touch } = useModified();

  const handleConfirm = async () => {
    await mutateAsync(null, {
      onSuccess: async () => {
        touch('orgs:members');
        onSave();
        onClose();
      },
    });
  };

  return (
    <ConfirmationForm
      buttonLabel={formatMessage(labels.leave)}
      message={
        <FormattedMessage
          {...messages.confirmLeave}
          values={{
            target: <b>{orgName}</b>,
          }}
        />
      }
      onConfirm={handleConfirm}
      onClose={onClose}
      isLoading={isPending}
      error={getErrorMessage(error)}
    />
  );
}
