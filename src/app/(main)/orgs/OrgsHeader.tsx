import { Row } from '@entro314labs/entro-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { OrgsAddButton } from './OrgsAddButton';
import { OrgsJoinButton } from './OrgsJoinButton';

export function OrgsHeader({ allowCreate = true }: { allowCreate?: boolean }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useLoginQuery();
  const edgeMode = !!process.env.EDGE_MODE;

  return (
    <PageHeader title={formatMessage(labels.orgs)}>
      <Row gap="3">
        {!edgeMode && <OrgsJoinButton />}
        {allowCreate && user.role !== ROLES.viewOnly && <OrgsAddButton />}
      </Row>
    </PageHeader>
  );
}
