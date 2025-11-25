import {
  Column,
  Icon,
  IconLabel,
  Menu,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
  Popover,
  Pressable,
  Row,
  SidebarItem,
  Text,
} from '@entro314labs/entro-zen';
import { useRouter } from 'next/navigation';
import type { Key } from 'react';
import {
  useLoginQuery,
  useMessages,
  useMobile,
  useNavigation,
  useUserOrgsQuery,
} from '@/components/hooks';
import { ChevronRight, User, Users } from '@/components/icons';

export interface NavButtonProps {
  showText?: boolean;
  onAction?: (id: Key) => void;
}

export function NavButton({ showText = true, onAction }: NavButtonProps) {
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();
  const { data } = useUserOrgsQuery(user.id);
  const { orgId, renderUrl } = useNavigation();
  const { isMobile } = useMobile();
  const router = useRouter();
  const org = data?.data?.find(o => o.orgId === orgId);
  const selectedKeys = new Set([orgId || user.id]);
  const label = orgId ? org?.name : user.displayName || user.email;

  const handleSelect = (id: Key) => {
    if (onAction) {
      onAction(id);
    }
    router.push(id === user.id ? renderUrl('/websites', false) : `/orgs/${id}/websites`);
  };

  if (!data?.count) {
    return null;
  }

  return (
    <MenuTrigger>
      <Pressable>
        <Row
          role="button"
          width="100%"
          alignItems="center"
          justifyContent="space-between"
          padding="2"
          border
          borderRadius
          shadow="1"
          maxHeight="40px"
          style={{ cursor: 'pointer', textWrap: 'nowrap', overflow: 'hidden', outline: 'none' }}
        >
          <Row alignItems="center" gap>
            <Icon>{orgId ? <Users /> : <User />}</Icon>
            {showText && <Text truncate>{label}</Text>}
          </Row>
          {showText && (
            <Icon rotate={90} size="sm">
              <ChevronRight />
            </Icon>
          )}
        </Row>
      </Pressable>
      <Popover placement={isMobile ? 'bottom' : 'bottom start'}>
        <Column minWidth="300px">
          <Menu
            selectionMode="single"
            selectedKeys={selectedKeys}
            autoFocus="last"
            onAction={handleSelect}
          >
            <MenuSection title={formatMessage(labels.myAccount)}>
              <MenuItem id={user.id}>
                <IconLabel icon={<User />}>
                  <Text wrap="nowrap">{user.displayName || user.email}</Text>
                </IconLabel>
              </MenuItem>
            </MenuSection>
            <MenuSeparator />
            <MenuSection title={formatMessage(labels.orgs)}>
              {Array.isArray(data?.data) &&
                data.data.map(({ orgId, name }) => (
                  <MenuItem key={orgId} id={orgId}>
                    <IconLabel icon={<Users />}>
                      <Text wrap="nowrap">{name}</Text>
                    </IconLabel>
                  </MenuItem>
                ))}
            </MenuSection>
          </Menu>
        </Column>
      </Popover>
    </MenuTrigger>
  );
}
