import type { Access } from 'payload'

import type { User } from '../../../payload-types'

import { isSuperAdmin } from '../../../access/isSuperAdmin'
import { getTenantAdminTenantAccessIDs } from '../../../utilities/getTenantAccessIDs'

export const createAccess: Access<User> = (args) => {
  const { req } = args
  if (!req.user) {
    return false
  }

  if (isSuperAdmin(args)) {
    return true
  }

  // 1) Narrow to a userDoc if collection === 'users'
  const userDoc = req.user?.collection === 'users' ? req.user : null

  // 2) Only call getTenantAdminTenantAccessIDs(userDoc) if it’s truly a user
  const adminTenantAccessIDs = userDoc
    ? getTenantAdminTenantAccessIDs(userDoc)
    : []

  if (adminTenantAccessIDs.length > 0) {
    return true
  }

  return false
}
