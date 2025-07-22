/* src/app/(dashboard)/dashboard/components/ui/LockedPerm.tsx */
'use client'

import React, { useState } from 'react'
import LockIcon from '@mui/icons-material/Lock'
import { Modal } from '@/app/(dashboard)/dashboard/components/ui/modal'

type LockedPermProps = {
  className?: string;
  label?: string;
};

export default function LockedPerm({
                                     className = 'overflow-visible !overflow-visible',
                                     label = 'Geen toestemming',
                                   }: LockedPermProps) {
  const [isOpen, setIsOpen] = useState(false)

  const dutchMessage =
    'Je hebt momenteel niet het juiste abonnement of de juiste permissies.\nNeem contact op met je dealer om het te kopen / verkrijgen.'

  /* helper – sluit modal en voorkom bubbling */
  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIsOpen(false)
  }

  return (
    <>
      {/* SLOT‑ICOON – klik staat uit zolang modal open is */}
      <button
        type="button"
        aria-label={label}
        disabled={isOpen}
        onClick={(e) => {
          e.stopPropagation()   // voorkom onverwachte form‑events
          setIsOpen(true)
        }}
        className={`flex cursor-pointer disabled:cursor-default ${className}`}
      >
        <LockIcon
          className="overflow-visible h-unset w-unset fill-gray-400 hover:fill-gray-500 disabled:hover:fill-gray-400 dark:fill-gray-400 dark:hover:fill-gray-300" />
      </button>

      {/* MODAL */}
      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Geen toegangsrechten
          </h2>

          <p className="whitespace-pre-line text-gray-600 dark:text-gray-300">
            {dutchMessage}
          </p>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="
                rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white
                hover:bg-brand-600 focus:outline-none
                dark:bg-brand-600 dark:hover:bg-brand-700
              "
            >
              Sluiten
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
