'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/app/(dashboard)/dashboard/components/ui/table'
import Badge from '@/app/(dashboard)/dashboard/components/ui/badge/Badge'

// Icon imports (example using MUI icons or your own icons)
import FilterListIcon from '@mui/icons-material/FilterList'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

// If you have a global `Customer` type:
import type { Customer } from '@/payload-types'

interface CustomersTableProps {
  customers: Customer[]
}

export default function CustomersTableClient({ customers }: CustomersTableProps) {
  // Local states for filtering
  const [nameFilter, setNameFilter] = useState('')
  const [emailFilter, setEmailFilter] = useState('')
  const [phoneFilter, setPhoneFilter] = useState('')
  const [enabledFilter, setEnabledFilter] = useState('')

  // Toggles for showing/hiding each column’s filter input
  const [showNameFilter, setShowNameFilter] = useState(false)
  const [showEmailFilter, setShowEmailFilter] = useState(false)
  const [showPhoneFilter, setShowPhoneFilter] = useState(false)
  const [showEnabledFilter, setShowEnabledFilter] = useState(false)

  // Example client-side filtering
  const filteredCustomers = customers.filter((cust) => {
    // 1) filter by name (firstname + lastname)
    if (nameFilter) {
      const combined = (cust.firstname + ' ' + cust.lastname).toLowerCase()
      if (!combined.includes(nameFilter.toLowerCase())) return false
    }

    // 2) filter by email
    if (emailFilter) {
      if (!cust.email.toLowerCase().includes(emailFilter.toLowerCase())) return false
    }

    // 3) filter by phone
    if (phoneFilter) {
      if (!cust.phone?.includes(phoneFilter)) return false
    }

    // 4) filter by enabled
    // allowed values: "", "true", "false" => if we do a simple select
    if (enabledFilter === 'true' && cust.enabled !== true) return false
    if (enabledFilter === 'false' && cust.enabled !== false) return false

    return true
  })

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {/* Name */}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                <div className="flex items-center gap-1">
                  Naam
                  <button
                    onClick={() => setShowNameFilter((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                    title="Filter"
                  >
                    <FilterListIcon className="w-4 h-4" />
                  </button>
                </div>
                {showNameFilter && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                      placeholder="Zoek op naam..."
                    />
                  </div>
                )}
              </TableCell>

              {/* Email */}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                <div className="flex items-center gap-1">
                  E-mail
                  <button
                    onClick={() => setShowEmailFilter((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                    title="Filter"
                  >
                    <FilterListIcon className="w-4 h-4" />
                  </button>
                </div>
                {showEmailFilter && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={emailFilter}
                      onChange={(e) => setEmailFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                      placeholder="Zoek op email..."
                    />
                  </div>
                )}
              </TableCell>

              {/* Phone */}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                <div className="flex items-center gap-1">
                  Telefoon
                  <button
                    onClick={() => setShowPhoneFilter((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                    title="Filter"
                  >
                    <FilterListIcon className="w-4 h-4" />
                  </button>
                </div>
                {showPhoneFilter && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={phoneFilter}
                      onChange={(e) => setPhoneFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                      placeholder="Zoek op telefoon..."
                    />
                  </div>
                )}
              </TableCell>

              {/* Enabled status */}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                <div className="flex items-center gap-1">
                  Status
                  <button
                    onClick={() => setShowEnabledFilter((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                    title="Filter"
                  >
                    <FilterListIcon className="w-4 h-4" />
                  </button>
                </div>
                {showEnabledFilter && (
                  <div className="mt-2">
                    <select
                      className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                      value={enabledFilter}
                      onChange={(e) => setEnabledFilter(e.target.value)}
                    >
                      <option value="">--Alle--</option>
                      <option value="true">Actief</option>
                      <option value="false">Inactief</option>
                    </select>
                  </div>
                )}
              </TableCell>

              {/* Actions */}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Acties
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {filteredCustomers.map((cust) => {
              const fullName = `${cust.firstname || ''} ${cust.lastname || ''}`.trim() || '—'

              // We'll use a badge for 'enabled'
              let badgeColor: 'success' | 'error' | 'warning' | 'info' = 'info'
              let badgeLabel = 'Onbekend'
              if (cust.enabled) {
                badgeColor = 'success'
                badgeLabel = 'Actief'
              } else {
                badgeColor = 'error'
                badgeLabel = 'Inactief'
              }

              return (
                <TableRow key={cust.id}>
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                    {fullName}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                    {cust.email}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                    {cust.phone || '—'}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                    <Badge size="sm" color={badgeColor}>
                      {badgeLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                    <Link
                      href={`/dashboard/customers/${cust.id}`}
                      className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition"
                      title="Bekijk klant"
                    >
                      {/* or your own eye icon */}
                      <VisibilityOutlinedIcon fontSize="small" />
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}

            {filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="px-5 py-4 text-center text-gray-500">
                  Geen klanten gevonden (na filter).
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
