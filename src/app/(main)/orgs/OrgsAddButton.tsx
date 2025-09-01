import { Button, Icon, Modal, DialogTrigger, Dialog, Text, useToast } from '@entro314labs/entro-zen';
import { Plus } from '@/components/icons';
import { useMessages, useModified } from '@/components/hooks';
import { OrgAddForm } from './OrgAddForm';
import { messages } from '@/components/messages';

export function OrgsAddButton({ onSave }: { onSave?: () => void }) {
  const { formatMessage, labels } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();

  const handleSave = async () => {
    toast(formatMessage(messages.saved));
    touch('orgs');
    onSave?.();
  };

  return (
    <DialogTrigger>
      <Button variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.createOrg)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.createOrg)} style={{ width: 400 }}>
          {({ close }) => <OrgAddForm onSave={handleSave} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
