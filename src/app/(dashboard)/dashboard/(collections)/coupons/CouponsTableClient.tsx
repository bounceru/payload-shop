'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/app/(dashboard)/dashboard/components/ui/table'
import Badge from '@/app/(dashboard)/dashboard/components/ui/badge/Badge'

// Example icons from MUI or your own
import FilterListIcon from '@mui/icons-material/FilterList'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

// If you have a global `Coupon` type in `payload-types`:
import type { Coupon } from '@/payload-types'

interface CouponsTableClientProps {
  coupons: Coupon[];
}

export default function CouponsTableClient({ coupons }: CouponsTableClientProps) {
  // Local states for filtering
  const [codeFilter, setCodeFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [enabledFilter, setEnabledFilter] = useState('')
  const [usedFilter, setUsedFilter] = useState('')

  // Toggles for showing/hiding each column’s filter
  const [showCodeFilter, setShowCodeFilter] = useState(false)
  const [showTypeFilter, setShowTypeFilter] = useState(false)
  const [showEnabledFilter, setShowEnabledFilter] = useState(false)
  const [showUsedFilter, setShowUsedFilter] = useState(false)

  // Basic client-side filtering
  const filteredCoupons = coupons.filter((cpn) => {
    // 1) Filter by code substring
    if (codeFilter && !cpn.code.toLowerCase().includes(codeFilter.toLowerCase())) {
      return false
    }

    // 2) Filter by discountType
    if (typeFilter && cpn.discountType !== typeFilter) {
      return false
    }

    // 3) Filter by enabled? -- e.g. "", "true", "false"
    if (enabledFilter === 'true' && !cpn.enabled) return false
    if (enabledFilter === 'false' && cpn.enabled) return false

    // 4) Filter by used => we can do a substring check on the number
    if (usedFilter) {
      const usedStr = String(cpn.used ?? 0)
      if (!usedStr.includes(usedFilter)) {
        return false
      }
    }

    return true
  })

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {/* Code */}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                <div className="flex items-center gap-1">
                  Code
                  <button
                    onClick={() => setShowCodeFilter((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                    title="Filter"
                  >
                    <FilterListIcon className="w-4 h-4" />
                  </button>
                </div>
                {showCodeFilter && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={codeFilter}
                      onChange={(e) => setCodeFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                      placeholder="Zoek code..."
                    />
                  </div>
                )}
              </TableCell>

              {/* discountType */}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                <div className="flex items-center gap-1">
                  Type
                  <button
                    onClick={() => setShowTypeFilter((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                    title="Filter"
                  >
                    <FilterListIcon className="w-4 h-4" />
                  </button>
                </div>
                {showTypeFilter && (
                  <div className="mt-2">
                    <select
                      className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <option value="">--Alle--</option>
                      <option value="fixed">Vast (€)</option>
                      <option value="percentage">Procent (%)</option>
                    </select>
                  </div>
                )}
              </TableCell>

              {/* used */}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                <div className="flex items-center gap-1">
                  Gebruikt (#)
                  <button
                    onClick={() => setShowUsedFilter((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                    title="Filter"
                  >
                    <FilterListIcon className="w-4 h-4" />
                  </button>
                </div>
                {showUsedFilter && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={usedFilter}
                      onChange={(e) => setUsedFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                      placeholder="Zoek aantal..."
                    />
                  </div>
                )}
              </TableCell>

              {/* enabled */}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                <div className="flex items-center gap-1">
                  Actief?
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
                      <option value="true">Ja</option>
                      <option value="false">Nee</option>
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
            {filteredCoupons.map((cpn) => {
              // For "enabled" => show a small badge
              const enabledColor: 'success' | 'error' = cpn.enabled ? 'success' : 'error'
              const enabledLabel = cpn.enabled ? 'Ja' : 'Nee'

              return (
                <TableRow key={cpn.id}>
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                    {cpn.code}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90 capitalize">
                    {cpn.discountType}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                    {cpn.used || 0}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                    <Badge size="sm" color={enabledColor}>
                      {enabledLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                    <Link
                      href={`/dashboard/coupons/${cpn.id}`}
                      className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition"
                      title="Bekijk Coupon"
                    >
                      <VisibilityOutlinedIcon fontSize="small" />
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}

            {filteredCoupons.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="px-5 py-4 text-center text-gray-500">
                  Geen coupons gevonden (na filter).
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
