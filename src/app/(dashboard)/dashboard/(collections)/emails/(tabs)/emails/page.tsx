// File: src/app/(dashboard)/dashboard/(collections)/emails/page.tsx

import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { CollectionShell } from '@/app/(dashboard)/dashboard/components/ui/CollectionShell'
import EmailsTableClient from './EmailsTableClient' // Our table client component

// Example: a local type matching what EmailsTableClient expects
interface EmailDoc {
  id: string;
  subject?: string;
  allCustomers?: boolean;
  recipients?: Array<string | { id: string }>;
  extraRecipients?: string;
  send?: boolean;
  sentAt?: string;
  sentToEmails?: string;
}

export const dynamic = 'force-dynamic'

export default async function EmailsListPage() {
  // 1) Read tenant from cookies if needed
  const cookieStore = await cookies()
  const tenantId = cookieStore.get('payload-tenant')?.value || ''

  // 2) Create a "where" filter object
  const where: any = {}
  if (tenantId) {
    where.tenant = { equals: tenantId }
  }

  // 3) Fetch from Payload
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'emails',
    where,
    limit: 50,
    sort: '-createdAt', // or whichever field you want to sort by
    depth: 1,
  })

  if (!result) {
    return notFound()
  }

  // 4) Convert the docs from Payload into your local EmailDoc type
  //    e.g. ensuring allCustomers is never null
  const safeEmails: EmailDoc[] = result.docs.map((doc: any) => ({
    id: doc.id,
    subject: doc.subject ?? '',
    allCustomers:
      doc.allCustomers === null ? false : doc.allCustomers, // coerce null -> false
    recipients: doc.recipients,
    extraRecipients: doc.extraRecipients,
    send: doc.send,
    sentAt: doc.sentAt ?? undefined,
    sentToEmails: doc.sentToEmails,
  }))

  return (
    <CollectionShell
      title="Emails"
      description="Manage your email campaigns or announcements"
      createHref="/dashboard/emails/new" // If you allow creating new Emails
    >
      {safeEmails.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No Emails found.
        </div>
      ) : (
        <EmailsTableClient emails={safeEmails} />
      )}
    </CollectionShell>
  )
}
