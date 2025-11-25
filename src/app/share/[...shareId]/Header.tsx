import { Icon, Row, Text, ThemeButton } from '@entro314labs/entro-zen';
import Link from 'next/link';
import { LogoSvg as Logo } from '@/components/icons';
import { LanguageButton } from '@/components/input/LanguageButton';
import { SettingsButton } from '@/components/input/SettingsButton';

export function Header() {
  return (
    <Row as="header">
      <Row gap>
        <Link href="https://entrolytics.click" target="_blank">
          <Icon size="lg">
            <Logo />
          </Icon>
          <Text>entrolytics</Text>
        </Link>
      </Row>
      <Row alignItems="center" gap>
        <ThemeButton />
        <LanguageButton />
        <SettingsButton />
      </Row>
    </Row>
  );
}
