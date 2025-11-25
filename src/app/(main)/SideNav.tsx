import {
  Row,
  Sidebar,
  SidebarHeader,
  SidebarItem,
  type SidebarProps,
  SidebarSection,
  ThemeButton,
} from '@entro314labs/entro-zen';
import Link from 'next/link';
import { useGlobalState, useMessages, useNavigation } from '@/components/hooks';
import {
  Globe,
  LayoutDashboard,
  Link as LinkIcon,
  LogoSvg as Logo,
  PanelLeft,
  Grid2x2 as Pixel,
  Settings,
} from '@/components/icons';
import { LanguageButton } from '@/components/input/LanguageButton';
import { NavButton } from '@/components/input/NavButton';
import { PanelButton } from '@/components/input/PanelButton';
import { ProfileButton } from '@/components/input/ProfileButton';

export function SideNav(props: SidebarProps) {
  const { formatMessage, labels } = useMessages();
  const { pathname, renderUrl, websiteId } = useNavigation();
  const [isCollapsed, setIsCollapsed] = useGlobalState('sidenav-collapsed');

  const hasNav = !!(websiteId || pathname.startsWith('/admin') || pathname.includes('/settings'));

  const links = [
    {
      id: 'boards',
      label: formatMessage(labels.boards),
      path: '/boards',
      icon: <LayoutDashboard />,
    },
    {
      id: 'websites',
      label: formatMessage(labels.websites),
      path: '/websites',
      icon: <Globe />,
    },
    {
      id: 'links',
      label: formatMessage(labels.links),
      path: '/links',
      icon: <LinkIcon />,
    },
    {
      id: 'pixels',
      label: formatMessage(labels.pixels),
      path: '/pixels',
      icon: <Pixel />,
    },
  ];

  const bottomLinks = [
    {
      id: 'settings',
      label: formatMessage(labels.settings),
      path: renderUrl('/settings'),
      icon: <Settings />,
    },
  ];

  return (
    <Row height="100%" backgroundColor border="right">
      <Sidebar {...props} isCollapsed={isCollapsed || hasNav} muteItems={false}>
        <SidebarSection onClick={() => setIsCollapsed(false)}>
          <SidebarHeader
            label="entrolytics"
            icon={isCollapsed && !hasNav ? <PanelLeft /> : <Logo />}
            style={{ maxHeight: 40 }}
          >
            {!isCollapsed && !hasNav && <PanelButton />}
          </SidebarHeader>
        </SidebarSection>
        <SidebarSection style={{ paddingTop: 0, paddingBottom: 0 }}>
          <NavButton showText={!hasNav && !isCollapsed} />
        </SidebarSection>
        <SidebarSection flexGrow={1}>
          {links.map(({ id, path, label, icon }) => {
            return (
              <Link key={id} href={renderUrl(path, false)} role="button">
                <SidebarItem
                  label={label}
                  icon={icon}
                  isSelected={pathname.includes(path)}
                  role="button"
                />
              </Link>
            );
          })}
        </SidebarSection>
        <SidebarSection>
          {bottomLinks.map(({ id, path, label, icon }) => {
            return (
              <Link key={id} href={path} role="button">
                <SidebarItem
                  label={label}
                  icon={icon}
                  isSelected={pathname.includes(path)}
                  role="button"
                />
              </Link>
            );
          })}
          <Row alignItems="center" justifyContent="space-between" height="40px">
            <ProfileButton />
            {!isCollapsed && !hasNav && (
              <Row>
                <LanguageButton />
                <ThemeButton />
              </Row>
            )}
          </Row>
        </SidebarSection>
      </Sidebar>
    </Row>
  );
}
