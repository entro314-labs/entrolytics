import { Button, DialogTrigger, Icon, Modal, Text } from '@entro314labs/entro-zen';
import type { ReactNode } from 'react';

export function ActionButton({
  onClick,
  icon,
  title,
  children,
}: {
  onClick?: () => void;
  icon?: ReactNode;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <DialogTrigger>
      <Text title={title}>
        <Button variant="quiet" onPress={onClick}>
          <Icon>{icon}</Icon>
        </Button>
      </Text>
      <Modal>{children}</Modal>
    </DialogTrigger>
  );
}
