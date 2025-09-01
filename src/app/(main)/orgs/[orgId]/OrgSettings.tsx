import { useState } from 'react';
import { Column, Tabs, TabList, Tab, TabPanel } from '@entro314labs/entro-zen';
import { useLoginQuery, useMessages, useNavigation, useOrg } from '@/components/hooks';

import { ROLES } from '@/lib/constants';
import { Users } from '@/components/icons';
import { OrgLeaveButton } from '@/app/(main)/orgs/OrgLeaveButton';
import { OrgManage } from './OrgManage';
import { OrgEditForm } from './OrgEditForm';
import { OrgWebsitesDataTable } from './OrgWebsitesDataTable';
import { OrgMembersDataTable } from './OrgMembersDataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';

export function OrgSettings({ orgId }: { orgId: string }) {
  const org = useOrg();
  const { formatMessage, labels } = useMessages();
  const { user } = useLoginQuery();
  const { query, pathname } = useNavigation();
  const [tab, setTab] = useState(query?.tab || 'details');

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
    <Column gap="6">
      <PageHeader title={org?.name} icon={<Users />}>
        {!isOrgOwner && !isAdmin && <OrgLeaveButton orgId={org.id} orgName={org.name} />}
      </PageHeader>
      <Panel>
        <Tabs selectedKey={tab} onSelectionChange={(value: any) => setTab(value)}>
          <TabList>
            <Tab id="details">{formatMessage(labels.details)}</Tab>
            <Tab id="members">{formatMessage(labels.members)}</Tab>
            <Tab id="websites">{formatMessage(labels.websites)}</Tab>
            {isOrgOwner && <Tab id="manage">{formatMessage(labels.manage)}</Tab>}
          </TabList>
          <TabPanel id="details" style={{ width: 500 }}>
            <OrgEditForm orgId={orgId} allowEdit={canEdit} />
          </TabPanel>
          <TabPanel id="members">
            <OrgMembersDataTable orgId={orgId} allowEdit />
          </TabPanel>
          <TabPanel id="websites">
            <OrgWebsitesDataTable orgId={orgId} allowEdit />
          </TabPanel>
          <TabPanel id="manage">
            <OrgManage orgId={orgId} />
          </TabPanel>
        </Tabs>
      </Panel>
    </Column>
  );
}
