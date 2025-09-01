import { useDeleteQuery, useMessages } from '@/components/hooks';
import { Icon, LoadingButton, Text } from '@entro314labs/entro-zen';
import { Close } from '@/components/icons';

export function OrgWebsiteRemoveButton({ orgId, websiteId, onSave }) {
  const { formatMessage, labels } = useMessages();
  const { mutate, isPending } = useDeleteQuery(`/orgs/${orgId}/websites/${websiteId}`);

  const handleRemoveOrgMember = async () => {
    mutate(null, {
      onSuccess: () => {
        onSave();
      },
    });
  };

  return (
    <LoadingButton variant="quiet" onClick={() => handleRemoveOrgMember()} isLoading={isPending}>
      <Icon>
        <Close />
      </Icon>
      <Text>{formatMessage(labels.remove)}</Text>
    </LoadingButton>
  );
}
