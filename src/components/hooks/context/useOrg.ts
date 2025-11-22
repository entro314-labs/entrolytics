import { OrgContext } from '@/app/(main)/orgs/OrgProvider'
import { useContext } from 'react'

export function useOrg() {
  return useContext(OrgContext)
}
