import { Key } from 'react';
import { useRouter } from 'next/navigation';
import {
  Text,
  Icon,
  Menu,
  MenuItem,
  MenuTrigger,
  MenuSection,
  MenuSeparator,
  Popover,
  Row,
  Box,
  SidebarItem,
  Pressable,
} from '@entro314labs/entro-zen';
import { useLoginQuery, useMessages, useUserOrgsQuery, useNavigation } from '@/components/hooks';
import { Chevron, User, Users } from '@/components/icons';

export function OrgsButton({ showText = true }: { showText?: boolean }) {
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();
  const { data } = useUserOrgsQuery(user.id);
  const { orgId } = useNavigation();
  const router = useRouter();
  const org = data?.data?.find(({ id }) => id === orgId);
  const selectedKeys = new Set([orgId || user.id]);
  const label = orgId ? org?.name : user.username;

  const handleSelect = (id: Key) => {
    router.push(id === user.id ? '/websites' : `/orgs/${id}/websites`);
  };

  if (!data?.count) {
    return null;
  }

  return (
    <MenuTrigger>
      <Pressable>
        <Row role="button" width="100%" backgroundColor="2" border borderRadius>
          <SidebarItem role="button" label={label} icon={orgId ? <Users /> : <User />}>
            {showText && (
              <Icon rotate={90} size="sm">
                <Chevron />
              </Icon>
            )}
          </SidebarItem>
        </Row>
      </Pressable>
      <Popover placement="bottom start">
        <Box minWidth="300px">
          <Menu
            selectionMode="single"
            selectedKeys={selectedKeys}
            autoFocus="last"
            onAction={handleSelect}
          >
            <MenuSection title={formatMessage(labels.myAccount)}>
              <MenuItem id={user.id}>
                <Row alignItems="center" gap>
                  <Icon>
                    <User />
                  </Icon>
                  <Text wrap="nowrap">{user.username}</Text>
                </Row>
              </MenuItem>
            </MenuSection>
            <MenuSeparator />
            <MenuSection title={formatMessage(labels.orgs)}>
              {data?.data?.map(({ id, name }) => (
                <MenuItem key={id} id={id}>
                  <Row alignItems="center" gap>
                    <Icon size="sm">
                      <Users />
                    </Icon>
                    <Text wrap="nowrap">{name}</Text>
                  </Row>
                </MenuItem>
              ))}
            </MenuSection>
          </Menu>
        </Box>
      </Popover>
    </MenuTrigger>
  );
}
