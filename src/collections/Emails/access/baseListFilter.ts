// File: src/collections/Emails/access/baseListFilter.ts

import type { BaseListFilter } from 'payload'
import { parseCookies } from 'payload'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { getTenantAccessIDs } from '@/utilities/getTenantAccessIDs'

export const baseListFilter: BaseListFilter = (args) => {
  const req = args.req
  const cookies = parseCookies(req.headers)
  const superAdmin = isSuperAdmin(args)
  const selectedTenant = cookies.get('payload-tenant')
  const userDoc = req.user?.collection === 'users' ? req.user : null
  const tenantAccessIDs = userDoc ? getTenantAccessIDs(userDoc) : []

  // If user is superAdmin or the selectedTenant is in the user’s tenant IDs
  // then filter to that tenant; else show no docs.
  if (
    selectedTenant &&
    (superAdmin || tenantAccessIDs.some((id) => id === selectedTenant))
  ) {
    return {
      tenant: {
        equals: selectedTenant,
      },
    }
  }

  return null
}
