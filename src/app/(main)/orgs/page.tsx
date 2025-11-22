import { Metadata } from 'next'
import { OrgsPage } from './OrgsPage'

export default function () {
  return <OrgsPage />
}

export const metadata: Metadata = {
  title: 'Orgs',
}
