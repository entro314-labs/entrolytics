import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  ListItem,
  Loading,
  Select,
  Text,
} from '@entro314labs/entro-zen';
import { type Key, useState } from 'react';
import {
  useLoginQuery,
  useMessages,
  useUpdateQuery,
  useUserOrgsQuery,
  useWebsite,
} from '@/components/hooks';
import { ROLES } from '@/lib/constants';

export function WebsiteTransferForm({
  websiteId,
  onSave,
  onClose,
}: {
  websiteId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { user } = useLoginQuery();
  const website = useWebsite();
  const [orgId, setOrgId] = useState<string>(null);
  const { formatMessage, labels, messages } = useMessages();
  const { mutateAsync, error, isPending } = useUpdateQuery(`/websites/${websiteId}/transfer`);
  const { data: orgs, isLoading } = useUserOrgsQuery(user.id);
  const isOrgWebsite = !!website?.orgId;

  const items =
    orgs?.data?.filter(({ orgUser }) =>
      orgUser.find(
        ({ role, userId }) =>
          [ROLES.orgOwner, ROLES.orgManager].includes(role) && userId === user.id,
      ),
    ) || [];

  const handleSubmit = async () => {
    await mutateAsync(
      {
        userId: website.orgId ? user.id : undefined,
        orgId: website.userId ? orgId : undefined,
      },
      {
        onSuccess: async () => {
          onSave?.();
          onClose?.();
        },
      },
    );
  };

  const handleChange = (key: Key) => {
    setOrgId(key as string);
  };

  if (isLoading) {
    return <Loading icon="dots" placement="center" />;
  }

  return (
    <Form onSubmit={handleSubmit} error={error} values={{ orgId }}>
      <Text>
        {formatMessage(
          isOrgWebsite ? messages.transferOrgWebsiteToUser : messages.transferUserWebsiteToOrg,
        )}
      </Text>
      <FormField name="orgId">
        {!isOrgWebsite && (
          <Select onSelectionChange={handleChange} selectedKey={orgId}>
            {items.map(({ orgId, name }) => {
              return (
                <ListItem key={orgId} id={orgId}>
                  {name}
                </ListItem>
              );
            })}
          </Select>
        )}
      </FormField>
      <FormButtons>
        <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
        <FormSubmitButton
          variant="primary"
          isPending={isPending}
          isDisabled={!isOrgWebsite && !orgId}
        >
          {formatMessage(labels.transfer)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
