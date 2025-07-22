'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/app/(dashboard)/dashboard/components/ui/table'
// If you use a <Badge>, import from wherever you keep it
import Badge from '@/app/(dashboard)/dashboard/components/ui/badge/Badge'

// Example icons (you might swap for your own or remove if unneeded)
import FilterListIcon from '@mui/icons-material/FilterList'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

// Example Email type if you have one in `payload-types` or define your own
interface EmailDoc {
  id: string;
  subject?: string;
  allCustomers?: boolean;
  recipients?: Array<string | { id: string }>;
  extraRecipients?: string;
  send?: boolean;
  sentAt?: string;        // date string
  sentToEmails?: string;  // read-only
}

interface EmailsTableClientProps {
  emails: EmailDoc[];
}

export default function EmailsTableClient({ emails }: EmailsTableClientProps) {
  // Filters
  const [subjectFilter, setSubjectFilter] = useState('')
  const [allCustomersFilter, setAllCustomersFilter] = useState('')
  const [sentFilter, setSentFilter] = useState('')

  // Toggles to show/hide filter inputs
  const [showSubjectFilter, setShowSubjectFilter] = useState(false)
  const [showAllCustomersFilter, setShowAllCustomersFilter] = useState(false)
  const [showSentFilter, setShowSentFilter] = useState(false)

  // Filter logic
  const filteredEmails = emails.filter((email) => {
    // 1) Subject substring filter
    if (subjectFilter) {
      const subj = email.subject?.toLowerCase() || ''
      if (!subj.includes(subjectFilter.toLowerCase())) {
        return false
      }
    }

    // 2) All Customers filter => "", "true", "false"
    if (allCustomersFilter === 'true' && !email.allCustomers) return false
    if (allCustomersFilter === 'false' && email.allCustomers) return false

    // 3) Sent filter => check if sentAt is present
    //    "", "sent", "draft"
    if (sentFilter === 'sent' && !email.sentAt) return false
    if (sentFilter === 'draft' && email.sentAt) return false

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
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
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

              {/* allCustomers */}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                <div className="flex items-center gap-1">
                  All Customers?
                  <button
                    onClick={() =>
                      setShowAllCustomersFilter((prev) => !prev)
                    }
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                    title="Filter by All Customers"
                  >
                    <FilterListIcon className="w-4 h-4" />
                  </button>
                </div>
                {showAllCustomersFilter && (
                  <div className="mt-2">
                    <select
                      className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                      value={allCustomersFilter}
                      onChange={(e) => setAllCustomersFilter(e.target.value)}
                    >
                      <option value="">--All--</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                )}
              </TableCell>

              {/* Sent / Draft */}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                <div className="flex items-center gap-1">
                  Status
                  <button
                    onClick={() => setShowSentFilter((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                    title="Filter by Sent or Draft"
                  >
                    <FilterListIcon className="w-4 h-4" />
                  </button>
                </div>
                {showSentFilter && (
                  <div className="mt-2">
                    <select
                      className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                      value={sentFilter}
                      onChange={(e) => setSentFilter(e.target.value)}
                    >
                      <option value="">--All--</option>
                      <option value="sent">Sent</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                )}
              </TableCell>

              {/* SentAt */}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Sent At
              </TableCell>

              {/* Actions */}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {filteredEmails.map((email) => {
              const isSent = !!email.sentAt
              const statusBadgeColor = isSent ? 'success' : 'error'
              const statusBadgeLabel = isSent ? 'Sent' : 'Draft'

              return (
                <TableRow key={email.id}>
                  {/* Subject */}
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                    {email.subject || '(no subject)'}
                  </TableCell>

                  {/* All Customers */}
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                    {email.allCustomers ? 'Yes' : 'No'}
                  </TableCell>

                  {/* Sent / Draft */}
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                    <Badge size="sm" color={statusBadgeColor}>
                      {statusBadgeLabel}
                    </Badge>
                  </TableCell>

                  {/* SentAt */}
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90 whitespace-nowrap">
                    {email.sentAt
                      ? new Date(email.sentAt).toLocaleString()
                      : '-'}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                    <Link
                      href={`/dashboard/emails/${email.id}`}
                      className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition"
                      title="View / Edit Email"
                    >
                      <VisibilityOutlinedIcon fontSize="small" />
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}

            {filteredEmails.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="px-5 py-4 text-center text-gray-500">
                  No emails found (after filter).
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
