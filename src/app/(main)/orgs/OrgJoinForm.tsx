import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  TextField,
} from '@entro314labs/entro-zen';
import { useMessages, useUpdateQuery } from '@/components/hooks';

export function OrgJoinForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const { formatMessage, labels } = useMessages();
  const { mutateAsync, error, isPending, touch } = useUpdateQuery('/orgs/join');

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        touch('orgs:members');
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
      <FormField
        label={formatMessage(labels.accessCode)}
        name="accessCode"
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField autoComplete="off" />
      </FormField>
      <FormButtons>
        <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
        <FormSubmitButton variant="primary" isPending={isPending}>
          {formatMessage(labels.join)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
