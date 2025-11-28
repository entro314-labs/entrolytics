import { Button, Column, Dialog, DialogTrigger, Modal } from '@entro314labs/entro-zen';
import { ActionForm } from '@/components/common/ActionForm';
import {
  useLoginQuery,
  useMessages,
  useModified,
  useNavigation,
  useUserOrgsQuery,
} from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { WebsiteDeleteForm } from './WebsiteDeleteForm';
import { WebsiteResetForm } from './WebsiteResetForm';
import { WebsiteTransferForm } from './WebsiteTransferForm';

export function WebsiteData({ websiteId, onSave }: { websiteId: string; onSave?: () => void }) {
  const { formatMessage, labels, messages } = useMessages();
  const { user } = useLoginQuery();
  const { touch } = useModified();
  const { router, pathname, orgId, renderUrl } = useNavigation();
  const { data: orgs } = useUserOrgsQuery(user.id);
  const isAdmin = pathname.startsWith('/admin');

  const canTransferWebsite =
    (
      (!orgId &&
        orgs?.data?.filter(({ members }) =>
          members?.find(
            ({ role, userId }) =>
              [ROLES.orgOwner, ROLES.orgManager].includes(role) && userId === user.id,
          ),
        )) ||
      []
    ).length > 0 ||
    (orgId &&
      !!orgs?.data
        ?.find(({ id }) => id === orgId)
        ?.members?.find(({ role, userId }) => role === ROLES.orgOwner && userId === user.id));

  const handleSave = () => {
    touch('websites');
    onSave?.();
    router.push(renderUrl(`/settings/websites`));
  };

  const handleReset = async () => {
    onSave?.();
  };

  return (
    <Column gap="6">
      {!isAdmin && (
        <ActionForm
          label={formatMessage(labels.transferWebsite)}
          description={formatMessage(messages.transferWebsite)}
        >
          <DialogTrigger>
            <Button isDisabled={!canTransferWebsite}>{formatMessage(labels.transfer)}</Button>
            <Modal>
              <Dialog title={formatMessage(labels.transferWebsite)} style={{ width: 400 }}>
                {({ close }) => (
                  <WebsiteTransferForm websiteId={websiteId} onSave={handleSave} onClose={close} />
                )}
              </Dialog>
            </Modal>
          </DialogTrigger>
        </ActionForm>
      )}

      <ActionForm
        label={formatMessage(labels.resetWebsite)}
        description={formatMessage(messages.resetWebsiteWarning)}
      >
        <DialogTrigger>
          <Button>{formatMessage(labels.reset)}</Button>
          <Modal>
            <Dialog title={formatMessage(labels.resetWebsite)} style={{ width: 400 }}>
              {({ close }) => (
                <WebsiteResetForm websiteId={websiteId} onSave={handleReset} onClose={close} />
              )}
            </Dialog>
          </Modal>
        </DialogTrigger>
      </ActionForm>

      <ActionForm
        label={formatMessage(labels.deleteWebsite)}
        description={formatMessage(messages.deleteWebsiteWarning)}
      >
        <DialogTrigger>
          <Button data-test="button-delete" variant="danger">
            {formatMessage(labels.delete)}
          </Button>
          <Modal>
            <Dialog title={formatMessage(labels.deleteWebsite)} style={{ width: 400 }}>
              {({ close }) => (
                <WebsiteDeleteForm websiteId={websiteId} onSave={handleSave} onClose={close} />
              )}
            </Dialog>
          </Modal>
        </DialogTrigger>
      </ActionForm>
    </Column>
  );
}
