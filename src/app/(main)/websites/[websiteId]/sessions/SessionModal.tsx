'use client';
import { Column, Dialog, Modal, type ModalProps } from '@entro314labs/entro-zen';
import { SessionDetailsPage } from '@/app/(main)/websites/[websiteId]/sessions/[sessionId]/SessionDetailsPage';
import { useNavigation } from '@/components/hooks';

export interface SessionModalProps extends ModalProps {
  websiteId: string;
}

export function SessionModal({ websiteId, ...props }: SessionModalProps) {
  const {
    router,
    query: { session },
    updateParams,
  } = useNavigation();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      router.push(updateParams({ session: undefined }));
    }
  };

  return (
    <Modal
      placement="bottom"
      offset="80px"
      isOpen={!!session}
      onOpenChange={handleOpenChange}
      isDismissable
      {...props}
    >
      <Column height="100%" maxWidth="1320px" style={{ margin: '0 auto' }}>
        <Dialog variant="sheet">
          <Column padding="6">
            <SessionDetailsPage websiteId={websiteId} sessionId={session as string} />
          </Column>
        </Dialog>
      </Column>
    </Modal>
  );
}
