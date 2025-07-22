import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import type { EmailDoc } from './EmailAdminDetail' // Import the local interface you're actually using
import EmailAdminDetail from './EmailAdminDetail'

export default async function EmailDetailPage({
                                                params: promiseParams,
                                              }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await promiseParams

  const cookieStore = await cookies()
  const tenantId = cookieStore.get('payload-tenant')?.value
  if (!tenantId) {
    return notFound()
  }

  const payload = await getPayload({ config })

  // Fetch shops for this tenant
  const shopsRes = await payload.find({
    collection: 'shops',
    where: { tenant: { equals: tenantId } },
    limit: 100,
    depth: 0,
  })
  const shops = shopsRes.docs.map((s: any) => ({ id: s.id, name: s.name || '' }))

  // Fetch customers for this tenant
  const customersRes = await payload.find({
    collection: 'customers',
    where: { tenant: { equals: tenantId } },
    limit: 100,
    depth: 0,
  })
  const customers = customersRes.docs.map((c: any) => ({
    id: c.id,
    email: c.email || '',
    firstname: c.firstname || '',
    lastname: c.lastname || '',
  }))

  if (id === 'new') {
    const initialEmail: EmailDoc = {
      tenant: tenantId,
      shops: [],
      allCustomers: false,
      recipients: [],
      extraRecipients: '',
      subject: '',
      body: '',
      send: false,
    }

    return (
      <EmailAdminDetail email={initialEmail} shops={shops} customers={customers} isNew />
    )
  }

  const email = await payload.findByID({
    collection: 'emails',
    id,
    depth: 2,
  })

  if (!email) {
    return notFound()
  }

  const emailTenant =
    typeof email.tenant === 'object' && email.tenant !== null
      ? email.tenant.id
      : email.tenant

  if (emailTenant !== tenantId) {
    return notFound()
  }

  const safeEmail: EmailDoc = {
    ...email,
    allCustomers: email.allCustomers ?? false,
    recipients: email.recipients ?? [],
    extraRecipients: email.extraRecipients ?? '',
    send: email.send ?? false,
    sentAt: email.sentAt ?? undefined,
    sentToEmails: email.sentToEmails ?? undefined,
  }

  return (
    <EmailAdminDetail email={safeEmail} shops={shops} customers={customers} />
  )
}
