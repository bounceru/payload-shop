'use client'

import { useState } from 'react'
import Link from 'next/link'

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/app/(dashboard)/dashboard/components/ui/table'
import type { Order } from '@/payload-types'
import { ChevronDown, Download, Eye, Filter, MoreHorizontal, Search, X } from 'lucide-react'
import Badge from '../../components/ui/badge/Badge'

/**
 * Props for the client component that receives array of orders from the server side.
 */
interface OrdersTableClientProps {
  orders: Order[]
}

export default function OrdersTableClient({ orders }: OrdersTableClientProps) {
  // Local states for filtering
  const [orderNrFilter, setOrderNrFilter] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [totalFilter, setTotalFilter] = useState('')
  const [globalSearch, setGlobalSearch] = useState('')

  // Toggles for showing/hiding each column’s filter input
  const [showOrderNrFilter, setShowOrderNrFilter] = useState(false)
  const [showCustomerFilter, setShowCustomerFilter] = useState(false)
  const [showStatusFilter, setShowStatusFilter] = useState(false)
  const [showTotalFilter, setShowTotalFilter] = useState(false)

  // Example client-side filtering
  const filteredOrders = orders.filter((ord) => {
    // Global search across multiple fields
    if (globalSearch) {
      const searchTerm = globalSearch.toLowerCase()
      const orderNr = String(ord.orderNr || '').toLowerCase()
      const customerName =
        typeof ord.customer === 'object'
          ? `${ord.customer?.firstname || ''} ${ord.customer?.lastname || ''}`.toLowerCase()
          : String(ord.customer || '').toLowerCase()
      const status = String(ord.status || '').toLowerCase()
      const total = String(ord.total || '').toLowerCase()

      if (![orderNr, customerName, status, total].some((field) => field.includes(searchTerm))) {
        return false
      }
    }

    // Existing filter logic...
    if (orderNrFilter && !String(ord.orderNr).includes(orderNrFilter)) return false
    if (customerFilter) {
      const first = typeof ord.customer === 'object' ? ord.customer?.firstname || '' : ''
      const last = typeof ord.customer === 'object' ? ord.customer?.lastname || '' : ''
      const combined = (first + ' ' + last).toLowerCase()
      if (!combined.includes(customerFilter.toLowerCase())) return false
    }
    if (statusFilter && ord.status !== statusFilter) return false
    if (totalFilter) {
      if (!String(ord.total || '').includes(totalFilter)) return false
    }

    return true
  })

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Search and Filters */}
      <div
        className="bg-gradient-to-r from-white via-gray-50/50 to-white dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 rounded-2xl border border-gray-200/60 dark:border-white/10 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Zoek bestellingen..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-white/10 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => setShowStatusFilter(!showStatusFilter)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${statusFilter
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800/50 dark:text-gray-300 dark:border-white/10 dark:hover:bg-gray-700/50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Status
                {statusFilter && (
                  <Badge>
                    1
                  </Badge>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showStatusFilter ? 'rotate-180' : ''}`} />
              </button>

              {showStatusFilter && (
                <div
                  className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg shadow-lg z-[9999]">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setStatusFilter('')
                        setShowStatusFilter(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      Alle statussen
                    </button>
                    {[
                      { value: 'paid', label: 'Betaald', color: 'success' },
                      { value: 'pending', label: 'In afwachting', color: 'warning' },
                      { value: 'cancelled', label: 'Geannuleerd', color: 'error' },
                      { value: 'failed', label: 'Mislukt', color: 'error' },
                    ].map((status) => (
                      <button
                        key={status.value}
                        onClick={() => {
                          setStatusFilter(status.value)
                          setShowStatusFilter(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${status.color === 'success'
                            ? 'bg-green-500'
                            : status.color === 'warning'
                              ? 'bg-yellow-500'
                              : status.color === 'error'
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                          }`}
                        />
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clear Filters */}
            {(statusFilter || globalSearch) && (
              <button
                onClick={() => {
                  setStatusFilter('')
                  setGlobalSearch('')
                  setOrderNrFilter('')
                  setCustomerFilter('')
                  setTotalFilter('')
                }}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                Wis filters
              </button>
            )}

            {/* Export Button */}
            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(statusFilter || globalSearch) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
            <span className="text-sm text-gray-600 dark:text-gray-400">Actieve filters:</span>
            {statusFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                                Status: {statusFilter}
                <button onClick={() => setStatusFilter('')} className="hover:text-blue-600">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
            )}
            {globalSearch && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                                Zoeken: "{globalSearch}"
                                <button onClick={() => setGlobalSearch('')} className="hover:text-blue-600">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Table Container */}
      <div
        className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/60 dark:border-white/10 shadow-sm overflow-hidden backdrop-blur-sm">


        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/30">
              <TableRow className="border-b border-gray-200 dark:border-white/10">
                <TableCell isHeader className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                                        <span
                                          className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Bestelling #
                                        </span>
                    <button
                      onClick={() => setShowOrderNrFilter(!showOrderNrFilter)}
                      className={`p-1 rounded transition-colors ${showOrderNrFilter ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                  </div>
                  {showOrderNrFilter && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={orderNrFilter}
                        onChange={(e) => setOrderNrFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Filter op nummer..."
                      />
                    </div>
                  )}
                </TableCell>

                <TableCell isHeader className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                                        <span
                                          className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Klant
                                        </span>
                    <button
                      onClick={() => setShowCustomerFilter(!showCustomerFilter)}
                      className={`p-1 rounded transition-colors ${showCustomerFilter ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                  </div>
                  {showCustomerFilter && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={customerFilter}
                        onChange={(e) => setCustomerFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Filter op klant..."
                      />
                    </div>
                  )}
                </TableCell>

                <TableCell isHeader className="px-6 py-4 text-left">
                                    <span
                                      className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </span>
                </TableCell>

                <TableCell isHeader className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                                        <span
                                          className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Totaal
                                        </span>
                    <button
                      onClick={() => setShowTotalFilter(!showTotalFilter)}
                      className={`p-1 rounded transition-colors ${showTotalFilter ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                  </div>
                  {showTotalFilter && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={totalFilter}
                        onChange={(e) => setTotalFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Filter op bedrag..."
                      />
                    </div>
                  )}
                </TableCell>

                <TableCell isHeader className="px-6 py-4 text-right">
                                    <span
                                      className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Acties
                                    </span>
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredOrders.map((ord, index) => {
                // Status logic
                let badgeColor: 'success' | 'warning' | 'error' | 'info' = 'info'
                if (ord.status === 'paid') badgeColor = 'success'
                if (ord.status === 'pending') badgeColor = 'warning'
                if (ord.status === 'cancelled') badgeColor = 'error'
                if (ord.status === 'failed') badgeColor = 'error'

                let dutchStatus: string = ord.status
                switch (ord.status) {
                  case 'paid':
                    dutchStatus = 'Betaald'
                    break
                  case 'pending':
                    dutchStatus = 'In afwachting'
                    break
                  case 'cancelled':
                    dutchStatus = 'Geannuleerd'
                    break
                  case 'failed':
                    dutchStatus = 'Mislukt'
                    break
                  default:
                    dutchStatus = ord.status || ''
                }

                let customerName = '—'
                if (typeof ord.customer === 'object' && ord.customer) {
                  const { firstname = '', lastname = '' } = ord.customer
                  customerName = (firstname + ' ' + lastname).trim() || '—'
                } else if (ord.customer) {
                  customerName = String(ord.customer)
                }

                return (
                  <TableRow
                    key={ord.id}
                    className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors border-b border-gray-100 dark:border-white/[0.05]"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">#{ord.orderNr}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{customerName}</div>
                          {typeof ord.customer === 'object' && ord.customer?.email && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{ord.customer.email}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <Badge>
                        {dutchStatus}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {typeof ord.total === 'number' ? `€${ord.total.toFixed(2)}` : '—'}
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/orders/${ord.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group-hover:scale-105"
                          title="Bekijk bestelling"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}

              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Search className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Geen bestellingen gevonden
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Probeer je zoekopdracht aan te passen of filters te wissen
                        </div>
                      </div>
                    </div>
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
