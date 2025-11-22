import { Fragment } from 'react'
import {
  Icon,
  Button,
  MenuTrigger,
  Popover,
  Menu,
  MenuItem,
  MenuSeparator,
  MenuSection,
  Text,
  Row,
} from '@entro314labs/entro-zen'
import { useMessages, useLoginQuery, useNavigation } from '@/components/hooks'
import { LogOut, UserCircle, LockKeyhole, BookText, LifeBuoy } from '@/components/icons'
import { DOCS_URL } from '@/lib/constants'

export function ProfileButton() {
  const { formatMessage, labels } = useMessages()
  const { user } = useLoginQuery()
  const { renderUrl } = useNavigation()
  const edgeMode = !!process.env.EDGE_MODE

  const items = [
    {
      id: 'profile',
      label: formatMessage(labels.profile),
      path: renderUrl('/settings/profile'),
      icon: <UserCircle />,
    },
    user.isAdmin &&
      !edgeMode && {
        id: 'admin',
        label: formatMessage(labels.admin),
        path: '/admin',
        icon: <LockKeyhole />,
      },
    edgeMode && {
      id: 'documentation',
      label: formatMessage(labels.documentation),
      path: DOCS_URL,
      icon: <BookText />,
      external: true,
    },
    edgeMode && {
      id: 'support',
      label: formatMessage(labels.support),
      path: 'mailto:support@entrolytics.click',
      icon: <LifeBuoy />,
      external: true,
    },
    {
      id: 'LogOut',
      label: formatMessage(labels.logout),
      path: '/logout',
      icon: <LogOut />,
      separator: true,
    },
  ].filter((n) => n)

  return (
    <MenuTrigger>
      <Button data-test="button-profile" variant="quiet">
        <Icon>
          <UserCircle />
        </Icon>
      </Button>
      <Popover placement="bottom end">
        <Menu autoFocus="last">
          <MenuSection title={user?.displayName || user?.email || 'User'}>
            <MenuSeparator />
            {items.map(({ id, path, label, icon, separator }) => {
              return (
                <Fragment key={id}>
                  {separator && <MenuSeparator />}
                  <MenuItem id={id} href={path}>
                    <Row alignItems="center" gap>
                      <Icon>{icon}</Icon>
                      <Text>{label}</Text>
                    </Row>
                  </MenuItem>
                </Fragment>
              )
            })}
          </MenuSection>
        </Menu>
      </Popover>
    </MenuTrigger>
  )
}
