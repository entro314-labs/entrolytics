'use client'
import { ReactNode } from 'react'
import { Grid, Column } from '@entro314labs/entro-zen'
import { useLoginQuery, useMessages, useNavigation } from '@/components/hooks'
import { User, Users, Globe } from '@/components/icons'
import { SideMenu } from '@/components/common/SideMenu'
import { PageBody } from '@/components/common/PageBody'

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useLoginQuery()
  const { formatMessage, labels } = useMessages()
  const { pathname } = useNavigation()

  if (!user.isAdmin) {
    return null
  }

  const items = [
    {
      label: formatMessage(labels.manage),
      items: [
        {
          id: 'users',
          label: formatMessage(labels.users),
          path: '/admin/users',
          icon: <User />,
        },
        {
          id: 'websites',
          label: formatMessage(labels.websites),
          path: '/admin/websites',
          icon: <Globe />,
        },
        {
          id: 'orgs',
          label: formatMessage(labels.orgs),
          path: '/admin/orgs',
          icon: <Users />,
        },
      ],
    },
  ]

  const selectedKey = items
    .flatMap((e) => e.items)
    ?.find(({ path }) => path && pathname.startsWith(path))?.id

  return (
    <Grid columns="auto 1fr" width="100%" height="100%">
      <Column height="100%" border="right" backgroundColor>
        <SideMenu
          items={items}
          title={formatMessage(labels.admin)}
          selectedKey={selectedKey}
          allowMinimize={false}
        />
      </Column>
      <PageBody>{children}</PageBody>
    </Grid>
  )
}
