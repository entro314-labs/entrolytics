'use client';
import { Column } from '@entrolytics/react-zen';
import { LoginForm } from './LoginForm';

export function LoginPage() {
  return (
    <Column justifyContent="center" alignItems="center" height="100vh" backgroundColor="2">
      <LoginForm />
    </Column>
  );
}
