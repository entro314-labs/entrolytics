import { Column, Heading } from '@entro314labs/entro-zen';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { UserEditForm } from './UserEditForm';
import { UserWebsites } from './UserWebsites';

export function UserSettings({ userId }: { userId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap="6">
      <Panel>
        <Heading size="2">{formatMessage(labels.details)}</Heading>
        <UserEditForm userId={userId} />
      </Panel>
      <Panel>
        <Heading size="2">{formatMessage(labels.websites)}</Heading>
        <UserWebsites userId={userId} />
      </Panel>
    </Column>
  );
}
