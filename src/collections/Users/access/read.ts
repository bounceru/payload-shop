import type { User } from '@/payload-types'
import type { Access, Where } from 'payload'

import { parseCookies } from 'payload'

import { isSuperAdmin } from '../../../access/isSuperAdmin'
import { getTenantAdminTenantAccessIDs } from '../../../utilities/getTenantAccessIDs'

export const readAccess: Access<User> = (args) => {
  const { req } = args
  if (!req?.user) {
    return false
  }

  const cookies = parseCookies(req.headers)
  const superAdmin = isSuperAdmin(args)
  const selectedTenant = cookies.get('payload-tenant')

  if (selectedTenant) {
    // If it's a super admin,
    // give them read access to only pages for that tenant
    if (superAdmin) {
      return {
        'tenants.tenant': {
          equals: selectedTenant,
        },
      }
    }

    // Narrow to 'users' only
    const userDoc = req.user?.collection === 'users' ? req.user : null;

    // Call only if it's truly a user, else use an empty array or other fallback
    const tenantAccessIDs = userDoc
      ? getTenantAdminTenantAccessIDs(userDoc)
      : [];

    const hasTenantAccess = tenantAccessIDs.some((id) => id === selectedTenant)

    // If NOT super admin,
    // give them access only if they have access to tenant ID set in cookie
    if (hasTenantAccess) {
      return {
        'tenants.tenant': {
          equals: selectedTenant,
        },
      }
    }
  }

  if (superAdmin) {
    return true
  }

  // 1) Narrow to a userDoc if collection === 'users'
  const userDoc = req.user?.collection === 'users' ? req.user : null;

  // 2) Only call getTenantAdminTenantAccessIDs(userDoc) if it’s truly a user
  const adminTenantAccessIDs = userDoc
    ? getTenantAdminTenantAccessIDs(userDoc)
    : [];

  return {
    'tenants.tenant': {
      in: adminTenantAccessIDs,
    },
  } as Where
}
