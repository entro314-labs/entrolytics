'use client';
import { Button, Column, Dialog, Icon, Modal, Row, type ModalProps } from '@entro314labs/entro-zen';
import { SessionDetailsPage } from '@/app/(main)/websites/[websiteId]/sessions/[sessionId]/SessionDetailsPage';
import { useNavigation } from '@/components/hooks';
import { X } from '@/components/icons';

export interface SessionModalProps extends ModalProps {
  websiteId: string;
}

export function SessionModal({ websiteId, ...props }: SessionModalProps) {
  const {
    router,
    query: { session },
    updateParams,
  } = useNavigation();

  const handleClose = (close: () => void) => {
    router.push(updateParams({ session: undefined }));
    close();
  };

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
          {({ close }) => (
            <Column padding="6" gap>
              <Row justifyContent="flex-end">
                <Button onPress={() => handleClose(close)} variant="quiet">
                  <Icon>
                    <X />
                  </Icon>
                </Button>
              </Row>
              <SessionDetailsPage websiteId={websiteId} sessionId={session as string} />
            </Column>
          )}
        </Dialog>
      </Column>
    </Modal>
  );
}
