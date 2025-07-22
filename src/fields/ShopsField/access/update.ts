import type { FieldAccess } from 'payload'

import { isSuperAdmin } from '../../../access/isSuperAdmin'
import { getTenantAccessIDs } from '../../../utilities/getTenantAccessIDs'

export const shopsFieldUpdate: FieldAccess = (args) => {
  const userDoc = args.req.user?.collection === 'users' ? args.req.user : null
  const tenantIDs = userDoc ? getTenantAccessIDs(userDoc) : []
  return Boolean(isSuperAdmin(args) || tenantIDs.length > 0)
}
