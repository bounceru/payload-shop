'use client'

import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/app/(dashboard)/dashboard/components/ui/table'

// If you use a Badge or icons:
import Badge from '@/app/(dashboard)/dashboard/components/ui/badge/Badge'
import FilterListIcon from '@mui/icons-material/FilterList'

interface NewsletterDoc {
  id: string;
  subject: string;
  status: string; // "draft" | "scheduled" | "sent"
  sendDate?: string;
  audience: string; // "all" | "tagged" | "event" | "manual"
}

interface NewslettersTableClientProps {
  newsletters: NewsletterDoc[];
}

export default function NewslettersTableClient({
                                                 newsletters,
                                               }: NewslettersTableClientProps) {
  // Filter states
  const [subjectFilter, setSubjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [audienceFilter, setAudienceFilter] = useState('')

  // Toggles for showing filter inputs
  const [showSubjectFilter, setShowSubjectFilter] = useState(false)
  const [showStatusFilter, setShowStatusFilter] = useState(false)
  const [showAudienceFilter, setShowAudienceFilter] = useState(false)

  // Filter logic
  const filteredNewsletters = newsletters.filter((nws) => {
    // 1) Subject filter
    if (
      subjectFilter &&
      !nws.subject.toLowerCase().includes(subjectFilter.toLowerCase())
    ) {
      return false
    }

    // 2) Status filter
    if (statusFilter && nws.status !== statusFilter) {
      return false
    }

    // 3) Audience filter
    if (audienceFilter && nws.audience !== audienceFilter) {
      return false
    }

    return true
  })

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {/* Subject */}
              <TableCell
                isHeader
                className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                <div className="flex items-center gap-1">
                  Subject
                  <button
                    onClick={() => setShowSubjectFilter((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                    title="Filter by Subject"
                  >
                    <FilterListIcon className="w-4 h-4" />
                  </button>
                </div>
                {showSubjectFilter && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                      placeholder="Search subject..."
                    />
                  </div>
                )}
              </TableCell>

              {/* Status */}
              <TableCell
                isHeader
                className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                <div className="flex items-center gap-1">
                  Status
                  <button
                    onClick={() => setShowStatusFilter((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                    title="Filter by Status"
                  >
                    <FilterListIcon className="w-4 h-4" />
                  </button>
                </div>
                {showStatusFilter && (
                  <div className="mt-2">
                    <select
                      className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">--All--</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="sent">Sent</option>
                    </select>
                  </div>
                )}
              </TableCell>

              {/* SendDate */}
              <TableCell
                isHeader
                className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Send Date
              </TableCell>

              {/* Audience */}
              <TableCell
                isHeader
                className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                <div className="flex items-center gap-1">
                  Audience
                  <button
                    onClick={() => setShowAudienceFilter((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                    title="Filter by Audience"
                  >
                    <FilterListIcon className="w-4 h-4" />
                  </button>
                </div>
                {showAudienceFilter && (
                  <div className="mt-2">
                    <select
                      className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                      value={audienceFilter}
                      onChange={(e) => setAudienceFilter(e.target.value)}
                    >
                      <option value="">--All--</option>
                      <option value="all">All</option>
                      <option value="tagged">Tagged</option>
                      <option value="event">Event</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                )}
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {filteredNewsletters.map((item) => {
              // Color-coded statuses (optional)
              let badgeColor: 'success' | 'warning' | 'info' = 'info'
              if (item.status === 'draft') badgeColor = 'warning'
              if (item.status === 'scheduled') badgeColor = 'info'
              if (item.status === 'sent') badgeColor = 'success'

              return (
                <TableRow key={item.id}>
                  {/* Subject */}
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                    {item.subject}
                  </TableCell>
                  {/* Status */}
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                    <Badge size="sm" color={badgeColor}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  {/* SendDate */}
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                    {item.sendDate
                      ? new Date(item.sendDate).toLocaleString()
                      : '-'}
                  </TableCell>
                  {/* Audience */}
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90 capitalize">
                    {item.audience}
                  </TableCell>
                </TableRow>
              )
            })}

            {filteredNewsletters.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="px-5 py-4 text-center text-gray-500">
                  No newsletters found (after filters).
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
