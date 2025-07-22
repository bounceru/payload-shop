// File: src/components/admin/ProductImportExport.server.tsx
import type { Payload } from 'payload'
import React from 'react'
import { cookies as getCookies, headers as getHeaders } from 'next/headers'

import ProductImportExportClient from './ProductImportExport.client'

// Inline helper that checks if the user object is a super admin
function isSuperAdminUser(user: any): boolean {
  if (!user) return false
  // If your "users" collection has a `roles` array, something like:
  //   user.roles = [ { name: 'Super Admin' }, { name: 'Reseller' }, { name: 'Something Else' } ]
  if (!Array.isArray(user.roles)) {
    return false
  }
  return user.roles.some((role: { name: string }) => role?.name === 'Super Admin' || role?.name === 'Reseller')
}

const ProductImportExport: React.FC<{
  payload: Payload;
}> = async (args) => {
  const cookies = await getCookies()
  const headers = await getHeaders()

  // 1) Auth user from Payload
  const { user } = await args.payload.auth({ headers })
  if (!user) return null

  // 2) Check super admin with our inline helper
  if (!isSuperAdminUser(user)) {
    // If not super admin => hide
    return null
  }

  // 3) If user is super admin => check tenant cookie
  const tenantCookie = cookies.get('payload-tenant')?.value
  if (!tenantCookie) return null

  return <ProductImportExportClient tenantCookie={tenantCookie} />
}

export default ProductImportExport
