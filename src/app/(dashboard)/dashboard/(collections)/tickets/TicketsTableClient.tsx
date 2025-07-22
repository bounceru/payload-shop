'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/app/(dashboard)/dashboard/components/ui/table'

interface TicketsTableClientProps {
  tickets: any[];
  events: any[];
  eventStats: Record<string, { sold: number; scanned: number; capacity: number }>;
}

export default function TicketsTableClient({ tickets, events, eventStats }: TicketsTableClientProps) {
  const [eventFilter, setEventFilter] = useState<string>('')

  const filteredTickets = tickets.filter((t) => {
    const evId = typeof t.event === 'object' ? t.event.id : t.event
    return !eventFilter || evId === eventFilter
  })

  const selectedStats = eventFilter ? eventStats[eventFilter] : null
  const selectedEvent = eventFilter ? events.find((ev) => ev.id === eventFilter) : null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm">Event:</label>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
        >
          <option value="">Alle events</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      {selectedStats && selectedEvent && (
        <div className="text-sm text-gray-700">
          <p className="font-medium">{selectedEvent.title}</p>
          <p>
            Verkocht: {selectedStats.sold} – Gescand: {selectedStats.scanned}
          </p>
          <p>
            Capaciteit: {selectedStats.capacity || '?'} – Bezetting:
            {selectedStats.capacity
              ? ` ${(selectedStats.sold / selectedStats.capacity * 100).toFixed(1)}%`
              : ' ?'}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-4 py-2 text-sm font-medium text-gray-500 text-left">
                  Barcode
                </TableCell>
                <TableCell isHeader className="px-4 py-2 text-sm font-medium text-gray-500 text-left">
                  Event
                </TableCell>
                <TableCell isHeader className="px-4 py-2 text-sm font-medium text-gray-500 text-left">
                  Type
                </TableCell>
                <TableCell isHeader className="px-4 py-2 text-sm font-medium text-gray-500 text-left">
                  Status
                </TableCell>
                <TableCell isHeader className="px-4 py-2 text-sm font-medium text-gray-500 text-center">
                  Gescant?
                </TableCell>
                <TableCell isHeader className="px-4 py-2 text-sm font-medium text-gray-500 text-left">
                  Klant
                </TableCell>
                <TableCell isHeader className="px-4 py-2 text-sm font-medium text-gray-500 text-left">
                  Acties
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredTickets.map((t) => {
                const ev = typeof t.event === 'object' ? t.event : events.find((e) => e.id === t.event)
                const typeLabel = typeof t.ticketType === 'object' ? t.ticketType.name : t.ticketType
                const customerLabel =
                  typeof t.customer === 'object'
                    ? `${t.customer.firstname || ''} ${t.customer.lastname || ''}`.trim()
                    : t.customer || ''
                const evId = typeof t.event === 'object' ? t.event.id : t.event
                return (
                  <TableRow key={t.id}>
                    <TableCell className="px-4 py-2 text-sm text-gray-600">{t.barcode}</TableCell>
                    <TableCell className="px-4 py-2 text-sm text-gray-600">{ev?.title || evId}</TableCell>
                    <TableCell className="px-4 py-2 text-sm text-gray-600">{typeLabel}</TableCell>
                    <TableCell className="px-4 py-2 text-sm text-gray-600 capitalize">{t.status}</TableCell>
                    <TableCell className="px-4 py-2 text-sm text-center">
                      {t.status === 'scanned' || t.scannedAt ? '✅' : '❌'}
                    </TableCell>
                    <TableCell className="px-4 py-2 text-sm text-gray-600">{customerLabel || '-'}</TableCell>
                    <TableCell className="px-4 py-2 text-sm text-gray-600">
                      <Link
                        href={`/dashboard/tickets/${t.id}`}
                        className="underline text-blue-600 hover:text-blue-800"
                      >
                        Bekijken
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredTickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-2 text-center text-gray-500">
                    Geen tickets gevonden.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
