import { Row } from '@entro314labs/entro-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { ROLES } from '@/lib/constants';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { OrgsJoinButton } from './OrgsJoinButton';
import { OrgsAddButton } from './OrgsAddButton';

export function OrgsHeader({ allowCreate = true }: { allowCreate?: boolean }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useLoginQuery();
  const cloudMode = !!process.env.cloudMode;

  return (
    <PageHeader title={formatMessage(labels.orgs)}>
      <Row gap="3">
        {!cloudMode && <OrgsJoinButton />}
        {allowCreate && user.role !== ROLES.viewOnly && <OrgsAddButton />}
      </Row>
    </PageHeader>
  );
}
