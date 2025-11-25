import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  ListItem,
  Select,
  TextField,
} from '@entro314labs/entro-zen';
import { useMessages, useUpdateQuery } from '@/components/hooks';
import { ROLES } from '@/lib/constants';

export function UserAddForm({ onSave, onClose }) {
  const { mutateAsync, error, isPending } = useUpdateQuery(`/users`);
  const { formatMessage, labels } = useMessages();

  const handleSubmit = async (data: any) => {
    // Transform data to match Clerk/API expectations
    const userData = {
      clerkId: data.clerkId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      displayName: data.displayName || data.email?.split('@')[0],
      role: data.role,
    };

    await mutateAsync(userData, {
      onSuccess: async () => {
        onSave(userData);
        onClose();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
      <FormField
        label={formatMessage(labels.email)}
        name="email"
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField autoComplete="email" data-test="input-email" type="email" />
      </FormField>
      <FormField
        label="Clerk ID"
        name="clerkId"
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField data-test="input-clerk-id" />
      </FormField>
      <FormField label="First Name" name="firstName">
        <TextField autoComplete="given-name" data-test="input-first-name" />
      </FormField>
      <FormField label="Last Name" name="lastName">
        <TextField autoComplete="family-name" data-test="input-last-name" />
      </FormField>
      <FormField
        label={formatMessage(labels.role)}
        name="role"
        rules={{ required: formatMessage(labels.required) }}
      >
        <Select>
          <ListItem id={ROLES.viewOnly} data-test="dropdown-item-viewOnly">
            {formatMessage(labels.viewOnly)}
          </ListItem>
          <ListItem id={ROLES.user} data-test="dropdown-item-user">
            {formatMessage(labels.user)}
          </ListItem>
          <ListItem id={ROLES.admin} data-test="dropdown-item-admin">
            {formatMessage(labels.admin)}
          </ListItem>
        </Select>
      </FormField>
      <FormButtons>
        <Button isDisabled={isPending} onPress={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
        <FormSubmitButton variant="primary" data-test="button-submit" isDisabled={false}>
          {formatMessage(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
