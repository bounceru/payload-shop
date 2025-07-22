'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'sonner'
import { DetailShell } from '@/app/(dashboard)/dashboard/components/ui/DetailShell'

interface SimpleShop {
  id: string;
  name?: string;
}

interface SimpleCustomer {
  id: string;
  email?: string;
  firstname?: string;
  lastname?: string;
}

export interface EmailDoc {
  id?: string;
  tenant?: string | { id: string };
  shops?: (string | { id: string })[];
  allCustomers?: boolean;
  recipients?: (string | { id: string })[];
  extraRecipients?: string;
  subject?: string;
  body?: string;
  send?: boolean;
  sentAt?: string;
  sentToEmails?: string;
}


interface EmailAdminDetailProps {
  email: EmailDoc;
  shops: SimpleShop[];
  customers: SimpleCustomer[];
  isNew?: boolean;
}

export default function EmailAdminDetail({
                                           email,
                                           shops,
                                           customers,
                                           isNew = false,
                                         }: EmailAdminDetailProps) {
  const router = useRouter()

  const [tempEmail, setTempEmail] = useState<EmailDoc>(() => {
    const clone = structuredClone(email)
    if (Array.isArray(clone.shops)) {
      clone.shops = clone.shops.map((s: any) => (typeof s === 'string' ? s : s.id))
    } else {
      clone.shops = []
    }
    if (Array.isArray(clone.recipients)) {
      clone.recipients = clone.recipients.map((r: any) => (typeof r === 'string' ? r : r.id))
    } else {
      clone.recipients = []
    }
    return clone
  })

  const [isChanged, setIsChanged] = useState(false)

  useEffect(() => {
    const original = JSON.stringify(email)
    const current = JSON.stringify(tempEmail)
    setIsChanged(original !== current)
  }, [tempEmail, email])

  function setFieldValue<T extends keyof EmailDoc>(field: T, value: EmailDoc[T]) {
    setTempEmail((prev) => ({ ...prev, [field]: value }))
  }

  function toggleArrayItem(field: 'shops' | 'recipients', id: string) {
    setTempEmail((prev) => {
      const arr: string[] = Array.isArray(prev[field]) ? [...(prev[field] as string[])] : []
      const idx = arr.indexOf(id)
      if (idx >= 0) {
        arr.splice(idx, 1)
      } else {
        arr.push(id)
      }
      return { ...prev, [field]: arr }
    })
  }

  async function handleSave() {
    try {
      const isCreate = isNew || !tempEmail.id || tempEmail.id === 'new'
      const method = isCreate ? 'POST' : 'PATCH'
      const body: any = structuredClone(tempEmail)

      if (Array.isArray(body.shops)) body.shops = body.shops
      if (Array.isArray(body.recipients)) body.recipients = body.recipients
      if (!isCreate && body.id === 'new') {
        delete body.id
      }

      const res = await fetch('/api/payloadProxy/emails', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        throw new Error('Failed to save email')
      }
      const result = await res.json()
      toast.success('Email opgeslagen!')
      setIsChanged(false)
      if (isCreate) {
        const newID = result?.doc?.id || result.id
        router.push(`/dashboard/emails/${newID}`)
      } else {
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      toast.error('Opslaan mislukt.')
    }
  }

  async function handleDelete() {
    if (!tempEmail.id || tempEmail.id === 'new') {
      toast.error('Geen ID om te verwijderen.')
      return
    }
    try {
      const delURL = `/api/payloadProxy/emails?id=${tempEmail.id}`
      const res = await fetch(delURL, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Email verwijderd!')
      router.push('/dashboard/emails/emails')
    } catch (err) {
      console.error(err)
      toast.error('Kon email niet verwijderen.')
    }
  }

  return (
    <DetailShell
      title={isNew ? 'Nieuwe Email' : `Email: ${tempEmail.subject || ''}`}
      description="Beheer een email"
      onBack={() => router.back()}
      onDelete={!isNew ? handleDelete : undefined}
      onDeleteLabel="Verwijderen"
      onSave={handleSave}
      saveLabel="Opslaan"
      saveDisabled={!isChanged}
    >
      <Toaster position="top-center" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            className="border rounded w-full p-2"
            value={tempEmail.subject || ''}
            onChange={(e) => setFieldValue('subject', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={!!tempEmail.send}
            onChange={(e) => setFieldValue('send', e.target.checked)}
          />
          <label className="text-sm">Send?</label>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={!!tempEmail.allCustomers}
            onChange={(e) => setFieldValue('allCustomers', e.target.checked)}
          />
          <label className="text-sm">All Customers</label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Extra Recipients</label>
          <textarea
            className="border rounded w-full p-2"
            rows={2}
            value={tempEmail.extraRecipients || ''}
            onChange={(e) => setFieldValue('extraRecipients', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium mb-1">Shops</label>
          <div className="border rounded p-2 max-h-32 overflow-auto space-y-1">
            {shops.map((shop) => {
              const selected = Array.isArray(tempEmail.shops) && (tempEmail.shops as string[]).includes(shop.id)
              return (
                <label key={shop.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleArrayItem('shops', shop.id)}
                  />
                  <span>{shop.name || shop.id}</span>
                </label>
              )
            })}
            {shops.length === 0 && <p className="text-sm text-gray-500">No shops</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Recipients</label>
          <div className="border rounded p-2 max-h-32 overflow-auto space-y-1">
            {customers.map((c) => {
              const label = `${c.firstname ?? ''} ${c.lastname ?? ''}`.trim() || c.email
              const selected = Array.isArray(tempEmail.recipients) && (tempEmail.recipients as string[]).includes(c.id)
              return (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleArrayItem('recipients', c.id)}
                  />
                  <span>{label}</span>
                </label>
              )
            })}
            {customers.length === 0 && <p className="text-sm text-gray-500">No customers</p>}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Body</label>
        <textarea
          className="border rounded w-full p-2"
          rows={6}
          value={tempEmail.body || ''}
          onChange={(e) => setFieldValue('body', e.target.value)}
        />
      </div>

      {!isNew && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sent At</label>
            <input
              className="border rounded w-full p-2"
              value={tempEmail.sentAt ? new Date(tempEmail.sentAt).toLocaleString() : '-'}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sent To Emails</label>
            <textarea
              className="border rounded w-full p-2"
              rows={2}
              value={tempEmail.sentToEmails || ''}
              readOnly
            />
          </div>
        </div>
      )}
    </DetailShell>
  )
}
