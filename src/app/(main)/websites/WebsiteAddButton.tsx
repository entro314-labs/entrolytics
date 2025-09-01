import { useMessages, useModified } from '@/components/hooks';
import { Button, Icon, Modal, Dialog, DialogTrigger, Text, useToast } from '@entro314labs/entro-zen';
import { Plus } from '@/components/icons';
import { WebsiteAddForm } from './WebsiteAddForm';

export function WebsiteAddButton({ orgId, onSave }: { orgId: string; onSave?: () => void }) {
  const { formatMessage, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();

  const handleSave = async () => {
    toast(formatMessage(messages.saved));
    touch('websites');
    onSave?.();
  };

  return (
    <DialogTrigger>
      <Button data-test="button-website-add" variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.addWebsite)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.addWebsite)} style={{ width: 400 }}>
          {({ close }) => <WebsiteAddForm orgId={orgId} onSave={handleSave} onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
