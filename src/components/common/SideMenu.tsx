import { ReactNode } from 'react'
import {
  Heading,
  NavMenu,
  NavMenuItem,
  Row,
  Column,
  NavMenuGroup,
  NavMenuProps,
  IconLabel,
} from '@entro314labs/entro-zen'
import Link from 'next/link'

export interface SideMenuProps extends NavMenuProps {
  items: {
    label: string
    items: { id: string; label: string; icon?: any; path: string }[]
  }[]
  title?: string
  selectedKey?: string
  allowMinimize?: boolean
  onItemClick?: () => void
  children?: ReactNode
}

export function SideMenu({
  items = [],
  title,
  selectedKey,
  allowMinimize,
  onItemClick,
  children,
  ...props
}: SideMenuProps) {
  return (
    <Column
      gap
      padding
      width="240px"
      maxHeight="100vh"
      overflowY="auto"
      justifyContent="space-between"
      position="sticky"
      top="0"
      backgroundColor
    >
      {children}
      {title && (
        <Row padding>
          <Heading size="1">{title}</Heading>
        </Row>
      )}
      <NavMenu muteItems={false} gap="6" {...props}>
        {Array.isArray(items) &&
          items.map(({ label, items }, index) => {
            return (
              <NavMenuGroup
                title={label}
                key={`${label}${index}`}
                gap="1"
                allowMinimize={allowMinimize}
                marginBottom="3"
              >
                {Array.isArray(items) &&
                  items.map(({ id, label, icon, path }) => {
                    const isSelected = selectedKey === id

                    return (
                      <Link key={id} href={path} onClick={onItemClick}>
                        <NavMenuItem isSelected={isSelected}>
                          <IconLabel icon={icon}>{label}</IconLabel>
                        </NavMenuItem>
                      </Link>
                    )
                  })}
              </NavMenuGroup>
            )
          })}
      </NavMenu>
    </Column>
  )
}
