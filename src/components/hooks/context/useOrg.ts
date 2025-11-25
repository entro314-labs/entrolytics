import { useContext } from 'react';
import { OrgContext } from '@/app/(main)/orgs/OrgProvider';

export function useOrg() {
  return useContext(OrgContext);
}
