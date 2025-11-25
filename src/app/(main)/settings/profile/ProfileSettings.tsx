import { Column, Label, Row } from '@entro314labs/entro-zen';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { PasswordChangeButton } from './PasswordChangeButton';

export function ProfileSettings() {
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();

  if (!user) {
    return null;
  }

  const { displayName, email, role } = user;

  const renderRole = (value: string) => {
    if (value === ROLES.user) {
      return formatMessage(labels.user);
    }
    if (value === ROLES.admin) {
      return formatMessage(labels.admin);
    }
    if (value === ROLES.viewOnly) {
      return formatMessage(labels.viewOnly);
    }

    return formatMessage(labels.unknown);
  };

  return (
    <Column width="400px" gap="6">
      <Column>
        <Label>{formatMessage(labels.name)}</Label>
        {displayName}
      </Column>
      <Column>
        <Label>{formatMessage(labels.email)}</Label>
        {email}
      </Column>
      <Column>
        <Label>{formatMessage(labels.role)}</Label>
        {renderRole(role)}
      </Column>
      <Column>
        <Label>{formatMessage(labels.account)}</Label>
        <Row>
          <PasswordChangeButton />
        </Row>
      </Column>
    </Column>
  );
}
