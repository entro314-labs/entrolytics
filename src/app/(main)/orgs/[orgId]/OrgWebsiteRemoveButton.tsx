import { Icon, LoadingButton, Text } from '@entro314labs/entro-zen';
import { useDeleteQuery, useMessages } from '@/components/hooks';
import { X as Close } from '@/components/icons';

export function OrgWebsiteRemoveButton({ orgId, websiteId, onSave }) {
  const { formatMessage, labels } = useMessages();
  const { mutateAsync } = useDeleteQuery(`/orgs/${orgId}/websites/${websiteId}`);

  const handleRemoveOrgMember = async () => {
    await mutateAsync(null, {
      onSuccess: () => {
        onSave();
      },
    });
  };

  return (
    <LoadingButton variant="quiet" onPress={() => handleRemoveOrgMember()}>
      <Icon>
        <Close />
      </Icon>
      <Text>{formatMessage(labels.remove)}</Text>
    </LoadingButton>
  );
}
