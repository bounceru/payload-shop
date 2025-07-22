// File: src/app/(dashboard)/dashboard/(collections)/shops/new/page.tsx
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'

import CreateShopWizard from './CreateShopWizard'

export default async function NewShopWizardPage() {
  // 1) Read the tenant ID from cookies
  const tenantId = (await cookies()).get('payload-tenant')?.value

  // 2) Optionally ensure the user is allowed to create shops for that tenant, etc.
  if (!tenantId) {
    // e.g. show 404 or redirect
    return notFound()
  }

  // 3) Optionally fetch some data from Payload if needed
  const payload = await getPayload({ config })
  const tenantDoc = await payload.findByID({
    collection: 'tenants',
    id: tenantId,
  })
  if (!tenantDoc) {
    return notFound()
  }

  // 4) Pass that tenantId to your <CreateShopWizard /> as a prop
  return <CreateShopWizard initialTenantId={tenantId} />
}
