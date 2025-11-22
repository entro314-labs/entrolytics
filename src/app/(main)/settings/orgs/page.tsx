import { Metadata } from 'next'
import { OrgsSettingsPage } from './OrgsSettingsPage'

export default function () {
  return <OrgsSettingsPage />
}

export const metadata: Metadata = {
  title: 'Orgs',
}
