import { Button, Dialog, DialogTrigger, Modal } from '@entro314labs/entro-zen';
import { useRouter } from 'next/navigation';
import { ActionForm } from '@/components/common/ActionForm';
import { useMessages, useModified } from '@/components/hooks';
import { OrgDeleteForm } from './OrgDeleteForm';

export function OrgManage({ orgId }: { orgId: string }) {
  const { formatMessage, labels, messages } = useMessages();
  const router = useRouter();
  const { touch } = useModified();

  const handleLeave = async () => {
    touch('orgs');
    router.push('/settings/orgs');
  };

  return (
    <ActionForm
      label={formatMessage(labels.deleteOrg)}
      description={formatMessage(messages.deleteOrgWarning)}
    >
      <DialogTrigger>
        <Button variant="danger">{formatMessage(labels.delete)}</Button>
        <Modal>
          <Dialog title={formatMessage(labels.deleteOrg)} style={{ width: 400 }}>
            {({ close }) => <OrgDeleteForm orgId={orgId} onSave={handleLeave} onClose={close} />}
          </Dialog>
        </Modal>
      </DialogTrigger>
    </ActionForm>
  );
}
