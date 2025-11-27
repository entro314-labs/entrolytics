import { Column, Icon, Row, Text } from '@entro314labs/entro-zen';
import Link from 'next/link';
import { OrgLeaveButton } from '@/app/(main)/orgs/OrgLeaveButton';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useLoginQuery, useMessages, useNavigation, useOrg } from '@/components/hooks';
import { ArrowLeft, Users } from '@/components/icons';
import { ROLES } from '@/lib/constants';
import { OrgEditForm } from './OrgEditForm';
import { OrgManage } from './OrgManage';
import { OrgMembersDataTable } from './OrgMembersDataTable';

export function OrgSettings({ orgId }: { orgId: string }) {
  const org = useOrg();
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();
  const { pathname } = useNavigation();

  const isAdmin = pathname.includes('/admin');

  const isOrgOwner =
    !!org?.members?.find(({ userId, role }) => role === ROLES.orgOwner && userId === user.id) &&
    user.role !== ROLES.viewOnly;

  const canEdit =
    user.isAdmin ||
    (!!org?.members?.find(
      ({ userId, role }) =>
        (role === ROLES.orgOwner || role === ROLES.orgManager) && userId === user.id,
    ) &&
      user.role !== ROLES.viewOnly);

  return (
    <>
      <Link href="/settings/orgs">
        <Row marginTop="2" alignItems="center" gap>
          <Icon rotate={180}>
            <ArrowLeft />
          </Icon>
          <Text>{formatMessage(labels.orgs)}</Text>
        </Row>
      </Link>

      <Column gap="6">
        <PageHeader title={org?.name} icon={<Users />}>
          {!isOrgOwner && !isAdmin && <OrgLeaveButton orgId={org.id} orgName={org.name} />}
        </PageHeader>
        <Panel>
          <OrgEditForm orgId={orgId} allowEdit={canEdit} />
        </Panel>
        <Panel>
          <OrgMembersDataTable orgId={orgId} allowEdit={canEdit} />
        </Panel>
        {isOrgOwner && (
          <Panel>
            <OrgManage orgId={orgId} />
          </Panel>
        )}
      </Column>
    </>
  );
}
