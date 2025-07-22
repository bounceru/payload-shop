'use client'

import React from 'react'
import { useTheme } from '@/app/(dashboard)/dashboard/context/ThemeContext'
import { FaChevronLeft, FaTrash } from 'react-icons/fa' // or your icon library
import { usePathname, useRouter } from 'next/navigation'

interface DetailShellProps {
  title: string;
  description?: string;
  onBack?: () => void;      // If you want a “back” button
  onDelete?: () => void;    // If you want a “delete” button
  onDeleteLabel?: string;   // The text for your delete button
  onSave?: () => void;      // If you want a “save” button
  saveDisabled?: boolean;   // If the “Save” button is disabled
  saveLabel?: string;       // The text for your save button
  deleteDisabled?: boolean;
  children: React.ReactNode;
}

export function DetailShell({
                              title,
                              description,
                              onBack,
                              onDelete,
                              onDeleteLabel = 'Delete',
                              onSave,
                              saveDisabled,
                              deleteDisabled = false,
                              saveLabel = 'Save',
                              children,
                            }: DetailShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { branding } = useTheme()
  const ctaColor = branding?.primaryColorCTA || '#ED6D38'

  // Go back to the parent route (e.g., /dashboard/events)
  const handleBack = () => {
    const pathParts = pathname?.split('/') || []
    if (pathParts.length > 1) {
      // Remove the last segment (the detail id)
      const parentPath = pathParts.slice(0, -1).join('/') || '/'
      router.push(parentPath)
    } else {
      router.back()
    }
  }

  return (
    <section className="w-full max-w-screen-xl mx-auto">
      {/* Top Bar */}
      <div
        className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sticky top-24 z-50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left side: Back button + Title / Description */}
          <div className="flex items-center gap-4">
            {/* If you want a back button */}
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1 px-3 py-3 text-lg font-medium text-gray-700 bg-gray-300 border border-gray-300 rounded-md hover:scale-105 hover:bg-gray-400 transition"
            >
              <FaChevronLeft />

            </button>

            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
              )}
            </div>
          </div>

          {/* Right side: Action buttons */}
          <div className="flex items-center gap-2">
            {/* DELETE button (optional) */}
            {onDelete && !deleteDisabled && (
              <button
                onClick={onDelete}
                className="inline-flex items-center justify-center px-4 py-3 rounded-md text-gray-700 text-lg font-semibold bg-gray-300 border border-gray-300 rounded-md hover:scale-105 hover:bg-gray-400 transition"
                aria-label="Delete"
              >
                <FaTrash />
              </button>
            )}

            {/* SAVE button (optional) */}
            {onSave && (
              <button
                onClick={onSave}
                disabled={saveDisabled}
                className={`inline-block px-5 py-3 rounded-md text-white text-sm font-semibold shadow transition
                  ${saveDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'hover:scale-105'
                }`}
                style={
                  saveDisabled ? undefined : { backgroundColor: ctaColor }
                }
              >
                {saveLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-4">{children}</div>
    </section>
  )
}
