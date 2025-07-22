// src/fields/TenantField/components/Field.tsx
import type { Payload } from 'payload'

import { cookies as getCookies, headers as getHeaders } from 'next/headers'
import React from 'react'

import { TenantFieldComponentClient } from './Field.client'

export const TenantFieldComponent: React.FC<{
  path: string
  payload: Payload
  readOnly: boolean
}> = async (args) => {
  const cookies = await getCookies()
  const headers = await getHeaders()
  const { user } = await args.payload.auth({ headers })

  // 1) Narrow the user to a "User" if collection === 'users'
  const userDoc = user?.collection === 'users' ? user : null

  // 2) Then do your check:
  if (
    userDoc &&
    (
      (Array.isArray(userDoc.tenants) && userDoc.tenants.length > 1) ||
      userDoc.roles?.includes('super-admin')
    )
  ) {
    return (
      <TenantFieldComponentClient
        initialValue={cookies.get('payload-tenant')?.value || undefined}
        path={args.path}
        readOnly={args.readOnly}
      />
    )
  }

  return null
}
