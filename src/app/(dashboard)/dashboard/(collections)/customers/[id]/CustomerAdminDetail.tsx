'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'sonner'

import { DetailShell } from '@/app/(dashboard)/dashboard/components/ui/DetailShell'
import Badge from '@/app/(dashboard)/dashboard/components/ui/badge/Badge'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/app/(dashboard)/dashboard/components/ui/table'

// Types
import type { Customer, Order, Ticket } from '@/payload-types'

/** The shape we'll accept from the server. */
interface CustomerDoc extends Customer {
  // e.g. converting null => undefined
  date_of_birth?: string
  phone?: string
}

/** Props for our client detail component */
interface CustomerAdminDetailProps {
  customer: Partial<CustomerDoc>
  relatedOrders?: Order[]
  relatedTickets?: Ticket[]
  isNew?: boolean
}

export default function CustomerAdminDetail({
                                              customer,
                                              relatedOrders = [],
                                              relatedTickets = [],
                                              isNew = false,
                                            }: CustomerAdminDetailProps) {
  const router = useRouter()

  // Make a local copy for editing
  const [tempCustomer, setTempCustomer] = useState<Partial<CustomerDoc>>(() => customer)
  const [isChanged, setIsChanged] = useState(false)

  // Compare original vs current => toggles “Save”
  useEffect(() => {
    const original = JSON.stringify(customer)
    const current = JSON.stringify(tempCustomer)
    setIsChanged(original !== current)
  }, [tempCustomer, customer])

  // Helper for updating fields
  function setFieldValue<T extends keyof CustomerDoc>(field: T, value: CustomerDoc[T]) {
    setTempCustomer((prev) => ({ ...prev, [field]: value }))
  }

  // Save => POST or PATCH
  async function handleSave() {
    try {
      const endpoint = '/api/payloadProxy/customers'
      const isCreate = isNew || !tempCustomer.id
      const method = isCreate ? 'POST' : 'PATCH'

      const body: any = { ...tempCustomer }
      if (!isCreate && body.id === 'new') {
        delete body.id
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        throw new Error(`Customer ${isCreate ? 'creation' : 'update'} failed`)
      }
      const result = await res.json()
      toast.success('Klant opgeslagen!')
      setIsChanged(false)

      if (isCreate) {
        const newID = result?.doc?.id || result.id
        if (newID) {
          router.push(`/dashboard/customers/${newID}`)
        } else {
          router.refresh()
        }
      } else {
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      toast.error('Opslaan mislukt')
    }
  }

  // Delete => e.g. “DELETE /api/payloadProxy/customers?id=...”
  async function handleDelete() {
    if (!tempCustomer.id || tempCustomer.id === 'new') {
      toast.error('Geen ID om te verwijderen.')
      return
    }
    try {
      const url = `/api/payloadProxy/customers?id=${tempCustomer.id}`
      const res = await fetch(url, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed.')
      toast.success('Klant verwijderd!')
      router.push('/dashboard/customers')
    } catch (err) {
      console.error(err)
      toast.error('Kon klant niet verwijderen')
    }
  }

  // We'll also create a small "badge" for "enabled"
  const enabledBadgeColor: 'success' | 'error' = tempCustomer.enabled ? 'success' : 'error'
  const enabledLabel = tempCustomer.enabled ? 'Actief' : 'Inactief'

  return (

    <DetailShell
      title={
        isNew
          ? 'Nieuwe Klant'
          : `${tempCustomer.firstname || ''} ${tempCustomer.lastname || ''}`
      }
      description="Beheer de velden van deze klant, plus gerelateerde bestellingen en tickets."
      onBack={() => router.back()}
      onDelete={!isNew ? handleDelete : undefined}
      onDeleteLabel="Verwijder Klant"
      onSave={handleSave}
      saveLabel="Opslaan"
      saveDisabled={!isChanged}
    >
      <Toaster position="top-center" />
      {/* Basic Info Card */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voornaam
            </label>
            <input
              type="text"
              className="border rounded w-full p-2"
              value={tempCustomer.firstname || ''}
              onChange={(e) => setFieldValue('firstname', e.target.value)}
            />
          </div>

          {/* Last name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Achternaam
            </label>
            <input
              type="text"
              className="border rounded w-full p-2"
              value={tempCustomer.lastname || ''}
              onChange={(e) => setFieldValue('lastname', e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mailadres
            </label>
            <input
              type="email"
              className="border rounded w-full p-2"
              value={tempCustomer.email || ''}
              onChange={(e) => setFieldValue('email', e.target.value)}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefoonnummer
            </label>
            <input
              type="text"
              className="border rounded w-full p-2"
              value={tempCustomer.phone || ''}
              onChange={(e) => setFieldValue('phone', e.target.value)}
            />
          </div>

          {/* date_of_birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geboortedatum
            </label>
            <input
              type="date"
              className="border rounded w-full p-2"
              value={tempCustomer.date_of_birth?.slice(0, 10) || ''}
              onChange={(e) => setFieldValue('date_of_birth', e.target.value)}
            />
          </div>

          {/* enabled checkbox */}
          <div className="flex items-center gap-2 mt-5">
            <input
              type="checkbox"
              checked={!!tempCustomer.enabled}
              onChange={(e) => setFieldValue('enabled', e.target.checked)}
            />
            <label className="text-sm font-medium text-gray-700">
              {enabledLabel}
            </label>
            <Badge color={enabledBadgeColor}>{enabledLabel}</Badge>
          </div>
        </div>
      </div>

      {/* Possibly show tags array */}
      <section className="mt-6">
        <h3 className="text-md font-semibold mb-2">Tags</h3>
        {Array.isArray(tempCustomer.tags) && tempCustomer.tags.length > 0 ? (
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {tempCustomer.tags.map((tagItem, idx) => (
              <li key={idx}>
                ID: {tagItem.tag_id || '?'} - Type: {tagItem.tag_type || '?'}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Geen tags.</p>
        )}
      </section>

      {/* Orders referencing this customer */}
      <section className="mt-8">
        <h3 className="text-md font-semibold mb-2">Gerelateerde Bestellingen</h3>

        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-4 py-2 text-sm font-medium text-gray-500 text-left"
                  >
                    Order #
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-2 text-sm font-medium text-gray-500 text-left"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-2 text-sm font-medium text-gray-500 text-left"
                  >
                    Totaal
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-2 text-sm font-medium text-gray-500 text-left"
                  >
                    Acties
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {relatedOrders.length > 0 ? (
                  relatedOrders.map((ord) => (
                    <TableRow key={ord.id}>
                      <TableCell className="px-4 py-2 text-sm text-gray-600">
                        #{ord.orderNr}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-sm text-gray-600 capitalize">
                        {ord.status}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-sm text-gray-600">
                        {typeof ord.total === 'number'
                          ? `€${ord.total.toFixed(2)}`
                          : '—'}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-sm text-gray-600">
                        <a
                          href={`/dashboard/orders/${ord.id}`}
                          className="underline text-blue-600 hover:text-blue-800"
                        >
                          Bekijken
                        </a>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="px-4 py-2 text-center text-gray-500"
                    >
                      Geen bestellingen.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* Tickets referencing this customer */}
      <section className="mt-8">
        <h3 className="text-md font-semibold mb-2">Gerelateerde Tickets</h3>

        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-4 py-2 text-sm font-medium text-gray-500 text-left"
                  >
                    Barcode
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-2 text-sm font-medium text-gray-500 text-left"
                  >
                    Event
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-2 text-sm font-medium text-gray-500 text-left"
                  >
                    Prijs
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-2 text-sm font-medium text-gray-500 text-left"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-2 text-sm font-medium text-gray-500 text-left"
                  >
                    Acties
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {relatedTickets.length > 0 ? (
                  relatedTickets.map((tix) => {
                    const eventLabel =
                      typeof tix.event === 'object' && tix.event?.title
                        ? tix.event.title
                        : '—'
                    return (
                      <TableRow key={tix.id}>
                        <TableCell className="px-4 py-2 text-sm text-gray-600">
                          {tix.barcode || '—'}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-sm text-gray-600">
                          {eventLabel}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-sm text-gray-600">
                          {typeof tix.price === 'number'
                            ? `€${tix.price.toFixed(2)}`
                            : '—'}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-sm text-gray-600 capitalize">
                          {tix.status}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-sm text-gray-600">
                          <a
                            href={`/dashboard/tickets/${tix.id}`}
                            className="underline text-blue-600 hover:text-blue-800"
                          >
                            Bekijken
                          </a>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="px-4 py-2 text-center text-gray-500"
                    >
                      Geen tickets.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </DetailShell>
  )
}
