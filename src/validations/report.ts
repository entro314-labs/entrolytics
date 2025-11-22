import { Auth } from '@/lib/types'
import { Report } from '@/lib/db'
import { canViewWebsite } from './website'

export async function canViewReport(auth: Auth, report: Report) {
  if (auth.user?.isAdmin) {
    return true
  }

  if (auth.user?.userId == report.userId) {
    return true
  }

  return !!(await canViewWebsite(auth, report.websiteId))
}

export async function canUpdateReport({ user }: Auth, report: Report) {
  if (user?.isAdmin) {
    return true
  }

  return user?.userId == report.userId
}

export async function canDeleteReport(auth: Auth, report: Report) {
  return canUpdateReport(auth, report)
}
