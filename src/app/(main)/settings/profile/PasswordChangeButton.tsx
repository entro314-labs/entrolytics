import { useClerk } from '@clerk/nextjs';
import { Button, Icon, Text } from '@entro314labs/entro-zen';
import { useMessages } from '@/components/hooks';
import { Settings } from '@/components/icons';

export function PasswordChangeButton() {
  const { formatMessage, labels } = useMessages();
  const { openUserProfile } = useClerk();

  const handleManageAccount = () => {
    // Open Clerk's user profile modal for account management
    openUserProfile({
      appearance: { elements: { rootBox: { zIndex: 9999 } } },
    });
  };

  return (
    <Button onPress={handleManageAccount}>
      <Icon>
        <Settings />
      </Icon>
      <Text>{formatMessage(labels.changePassword)}</Text>
    </Button>
  );
}
