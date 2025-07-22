import CreateCustomerWizard from './CreateCustomerWizard'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'

export default async function NewCustomerWizardPage() {
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
  return <CreateCustomerWizard initialTenantId={tenantId} />
}
