'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'sonner'
import Barcode from 'react-barcode' // <-- add at the top
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/app/(dashboard)/dashboard/components/ui/table'

import { DetailShell } from '@/app/(dashboard)/dashboard/components/ui/DetailShell'
import type { Addon, Ticket } from '@/payload-types'

import { AlertCircle, CheckCircle, Clock, RefreshCw, XCircle } from 'lucide-react'

interface CustomerData {
  id: string
  firstname?: string
  lastname?: string
  email?: string
  phone?: string
  date_of_birth?: string | null

  [key: string]: any
}

interface EventData {
  id: string
  title?: string

  [key: string]: any
}

/** The shape of an order. Adjust to your real data. */
interface OrderDoc {
  id?: string
  orderNr?: number
  tenant?: string | { id: string }
  customer?: string | CustomerData
  tickets?: (Ticket | string)[]
  addons?: (Addon | string)[]
  event?: string | EventData
  status?: string
  total?: number
  createdAt?: string
  paymentReference?: string
  // etc. Add or remove as needed
}

export default function OrderAdminDetailClient({
                                                 order,
                                                 isNew = false,
                                               }: {
  order: OrderDoc
  isNew?: boolean
}) {
  const router = useRouter()

  const [tempOrder, setTempOrder] = useState<OrderDoc>(() => order)
  const [isChanged, setIsChanged] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(isNew)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [refundAmount, setRefundAmount] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')

  // Compare original vs current => toggles “Save”
  useEffect(() => {
    const original = JSON.stringify(order)
    const current = JSON.stringify(tempOrder)
    setIsChanged(original !== current)
  }, [tempOrder, order])

  // Handle save => POST/PATCH
  async function handleSave() {
    setIsLoading(true)
    try {
      const endpoint = '/api/payloadProxy/orders'
      const isCreate = isNew || !tempOrder.id
      const method = isCreate ? 'POST' : 'PATCH'

      const body: any = { ...tempOrder }

      // Flatten relationships if needed
      // e.g. if (typeof body.customer === "object") body.customer = body.customer.id;
      // e.g. if (typeof body.event === "object") body.event = body.event.id;

      if (!isCreate && body.id === 'new') {
        delete body.id
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errorData = await res.json()
        const errorMessage = errorData?.message || `Order ${isCreate ? 'creation' : 'update'} failed`
        throw new Error(errorMessage)
      }
      const result = await res.json()
      toast.success('Order saved!')
      setIsChanged(false)
      setEditMode(false)

      if (isCreate) {
        const newId = result?.doc?.id || result.id
        if (newId) {
          router.push(`/dashboard/orders/${newId}`)
        } else {
          router.refresh()
        }
      } else {
        router.refresh()
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Save failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle delete
  async function handleDelete() {
    setShowDeleteDialog(false)
    if (!tempOrder.id || tempOrder.id === 'new') {
      toast.error('No ID to delete!')
      return
    }
    setIsLoading(true)
    try {
      const delUrl = `/api/payloadProxy/orders?id=${tempOrder.id}`
      const res = await fetch(delUrl, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('Delete failed')
      }
      toast.success('Order deleted!')
      router.push('/dashboard/orders')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete order')
    } finally {
      setIsLoading(false)
    }
  }

  function setFieldValue<T extends keyof OrderDoc>(field: T, value: OrderDoc[T]) {
    setTempOrder((prev) => ({ ...prev, [field]: value }))
  }

  // Example status => badge color mapping
  let badgeColor: 'success' | 'warning' | 'error' | 'info' = 'info'
  let statusText = ''
  let statusIcon = null

  switch (tempOrder.status) {
    case 'paid':
      badgeColor = 'success'
      statusText = 'Betaald'
      statusIcon = <CheckCircle className="h-4 w-4 mr-2" />
      break
    case 'pending':
      badgeColor = 'warning'
      statusText = 'In afwachting'
      statusIcon = <Clock className="h-4 w-4 mr-2" />
      break
    case 'failed':
      badgeColor = 'error'
      statusText = 'Mislukt'
      statusIcon = <XCircle className="h-4 w-4 mr-2" />
      break
    case 'cancelled':
      badgeColor = 'error'
      statusText = 'Geannuleerd'
      statusIcon = <AlertCircle className="h-4 w-4 mr-2" />
      break
    case 'refunded':
      badgeColor = 'info'
      statusText = 'Terugbetaald'
      statusIcon = <RefreshCw className="h-4 w-4 mr-2" />
      break
    default:
      statusText = tempOrder.status || 'Onbekend'
      break
  }

  // Format "createdAt"
  const placedOn = tempOrder.createdAt ? new Date(tempOrder.createdAt).toLocaleString() : ''

  // Pull out event title if we have it
  const eventTitle =
    typeof tempOrder.event === 'object' ? tempOrder.event?.title || '(No Title)' : tempOrder.event || '(No event)'

  // Pull out some customer details if we have them
  let customerName = ''
  let customerEmail = ''
  let customerPhone = ''
  if (typeof tempOrder.customer === 'object' && tempOrder.customer) {
    const { firstname, lastname, email, phone } = tempOrder.customer
    customerName = [firstname, lastname].filter(Boolean).join(' ') || '(No name)'
    customerEmail = email || ''
    customerPhone = phone || ''
  }

  const handleRefund = async () => {
    setShowRefundDialog(false)
    setIsLoading(true)
    try {
      // Simulate refund processing
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success(`€${refundAmount.toFixed(2)} terugbetaald!`)
      setFieldValue('status', 'refunded')
    } catch (error) {
      console.error('Refund error:', error)
      toast.error('Refund mislukt.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} gekopieerd!`)
  }

  return (
    <DetailShell
      title={isNew ? 'Create Order' : `Order #${tempOrder.orderNr || ''}`}
      description={`${customerName} • ${eventTitle}`}
      onBack={() => router.back()}
      onDelete={!isNew ? handleDelete : undefined}
      onDeleteLabel="Delete Order"
      deleteDisabled={true}
      onSave={handleSave}
      saveDisabled={!isChanged}
      saveLabel="Save Order"
    >
      <Toaster position="top-center" />

      {/* Status Alert */}
      <div
        className={`mb-6 rounded-xl border p-4 ${tempOrder.status === 'paid'
          ? 'bg-green-50 border-green-200'
          : tempOrder.status === 'pending'
            ? 'bg-yellow-50 border-yellow-200'
            : tempOrder.status === 'failed'
              ? 'bg-red-50 border-red-200'
              : tempOrder.status === 'cancelled'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${tempOrder.status === 'paid'
              ? 'bg-green-500'
              : tempOrder.status === 'pending'
                ? 'bg-yellow-500'
                : tempOrder.status === 'failed'
                  ? 'bg-red-500'
                  : tempOrder.status === 'cancelled'
                    ? 'bg-red-500'
                    : 'bg-blue-500'
            }`}
          />
          <div>
            <p
              className={`font-semibold ${tempOrder.status === 'paid'
                ? 'text-green-800'
                : tempOrder.status === 'pending'
                  ? 'text-yellow-800'
                  : tempOrder.status === 'failed'
                    ? 'text-red-800'
                    : tempOrder.status === 'cancelled'
                      ? 'text-red-800'
                      : 'text-blue-800'
              }`}
            >
              Status:{' '}
              {tempOrder.status === 'paid'
                ? 'Betaald'
                : tempOrder.status === 'pending'
                  ? 'In afwachting'
                  : tempOrder.status === 'failed'
                    ? 'Mislukt'
                    : tempOrder.status === 'cancelled'
                      ? 'Geannuleerd'
                      : tempOrder.status || 'Onbekend'}
            </p>
            <p
              className={`text-sm ${tempOrder.status === 'paid'
                ? 'text-green-600'
                : tempOrder.status === 'pending'
                  ? 'text-yellow-600'
                  : tempOrder.status === 'failed'
                    ? 'text-red-600'
                    : tempOrder.status === 'cancelled'
                      ? 'text-red-600'
                      : 'text-blue-600'
              }`}
            >
              {tempOrder.status === 'pending' && 'Wachten op betalingsbevestiging'}
              {tempOrder.status === 'failed' && 'Betaling mislukt - controleer betalingsgegevens'}
              {tempOrder.status === 'cancelled' && 'Bestelling geannuleerd door klant of systeem'}
              {tempOrder.status === 'paid' && 'Betaling succesvol verwerkt'}
            </p>
          </div>
        </div>
      </div>

      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Order Summary */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Order Details</h3>
                <p className="text-sm text-gray-500">#{tempOrder.orderNr}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Order ID</span>
                <span className="text-sm font-medium">{tempOrder.id || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="text-lg font-bold text-green-600">€{(tempOrder.total || 0).toFixed(2)}</span>
              </div>
              {placedOn && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium">{placedOn}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Customer</h3>
                <p className="text-sm text-gray-500">{customerName || '—'}</p>
              </div>
            </div>
            <div className="space-y-2">
              {customerEmail && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {customerEmail}
                </div>
              )}
              {customerPhone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {customerPhone}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Info */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Event</h3>
                <p className="text-sm text-gray-500">{eventTitle}</p>
              </div>
            </div>
            {tempOrder.paymentReference && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Mollie Payment ID</p>
                <p className="text-sm font-mono text-gray-700">{tempOrder.paymentReference}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Editable Fields */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bestelnummer</label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                value={tempOrder.orderNr || ''}
                onChange={(e) => setFieldValue('orderNr', Number(e.target.value))}
                disabled={!isNew}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                value={tempOrder.status || 'paid'}
                onChange={(e) => setFieldValue('status', e.target.value)}
              >
                <option value="paid">Betaald</option>
                <option value="pending">In afwachting</option>
                <option value="failed">Mislukt</option>
                <option value="cancelled">Geannuleerd</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Totaal (€)</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                value={tempOrder.total || 0}
                onChange={(e) => setFieldValue('total', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Tickets</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1V7a2 2 0 00-2-2H5zM5 14a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1v-3a2 2 0 00-2-2H5z"
                />
              </svg>
              {Array.isArray(tempOrder.tickets) ? tempOrder.tickets.length : 0} tickets
            </div>
          </div>

          {Array.isArray(tempOrder.tickets) && tempOrder.tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tempOrder.tickets.map((tick, idx) => {
                if (typeof tick === 'object') {
                  const t = tick as Ticket
                  return (
                    <div
                      key={t.id || idx}
                      className="relative overflow-hidden bg-gradient-to-r from-white to-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300"
                    >
                      {/* Ticket stub design */}
                      <div
                        className="absolute right-0 top-0 bottom-0 w-8 bg-gray-100 border-l-2 border-dashed border-gray-300">
                        <div
                          className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-white border-2 border-dashed border-gray-300 rounded-full" />
                      </div>

                      <div className="pr-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1V7a2 2 0 00-2-2H5zM5 14a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1v-3a2 2 0 00-2-2H5z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Seat {t.seatRow || '?'}-{t.seatNumber || '?'}
                            </p>
                            <p className="text-sm text-green-600 font-medium">
                              {typeof t.price === 'number' ? `€${t.price.toFixed(2)}` : '—'}
                            </p>
                          </div>
                        </div>

                        {t.barcode && (
                          <div className="mt-3">
                            <div className="bg-white p-2 rounded border">
                              <Barcode
                                value={String(t.barcode)}
                                width={1.2}
                                height={30}
                                fontSize={8}
                                displayValue={false}
                                background="transparent"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1 font-mono text-center">{t.barcode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
                    {String(tick)}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1V7a2 2 0 00-2-2H5zM5 14a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1v-3a2 2 0 00-2-2H5z"
                />
              </svg>
              <p className="text-gray-500">Geen tickets gevonden voor deze bestelling</p>
            </div>
          )}
        </div>

        {/* Add-ons Section */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add-ons</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {Array.isArray(tempOrder.addons) ? tempOrder.addons.length : 0} add-ons
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableCell isHeader className="px-6 py-4 text-sm font-semibold text-gray-900">
                    Naam
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-sm font-semibold text-gray-900">
                    Prijs
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(tempOrder.addons) && tempOrder.addons.length > 0 ? (
                  tempOrder.addons.map((ad, idx) => {
                    if (typeof ad === 'object') {
                      const a = ad as Addon
                      return (
                        <TableRow key={a.id || idx} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="px-6 py-4 text-sm font-medium text-gray-900">{a.name}</TableCell>
                          <TableCell className="px-6 py-4 text-sm font-semibold text-green-600">
                            {a.price !== undefined ? `€${a.price.toFixed(2)}` : '—'}
                          </TableCell>
                        </TableRow>
                      )
                    }
                    return (
                      <TableRow key={idx} className="hover:bg-gray-50 transition-colors">
                        <TableCell colSpan={2} className="px-6 py-4 text-sm text-gray-500">
                          {String(ad)}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-8 h-8 text-gray-400 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <p className="text-gray-500">Geen add-ons gevonden</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DetailShell>
  )
}
