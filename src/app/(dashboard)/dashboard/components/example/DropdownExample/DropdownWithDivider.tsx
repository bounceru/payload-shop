'use client'
import { Dropdown } from '../../ui/dropdown/Dropdown'
import { DropdownItem } from '../../ui/dropdown/DropdownItem'
import React, { useState } from 'react'

export default function DropdownWithDivider() {
  const [isOpen, setIsOpen] = useState(false)

  function toggleDropdown() {
    setIsOpen(!isOpen)
  }

  function closeDropdown() {
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleDropdown}
        className="inline-flex dropdown-toggle items-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600"
      >
        Options
        <svg
          className={`duration-200 ease-in-out stroke-current ${isOpen ? 'rotate-180' : ''
          }`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.79199 7.396L10.0003 12.6043L15.2087 7.396"
            stroke=""
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        className="absolute left-0 top-full z-40 mt-2 w-full min-w-[260px] rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-[#1E2635]"
        isOpen={isOpen}
        onClose={closeDropdown}
      >
        <ul className="flex flex-col gap-1">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Edit
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Duplicate
            </DropdownItem>
          </li>
          <li>
            <span className="my-1.5 block h-px w-full bg-gray-200 dark:bg-[#353C49]"></span>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Archive
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Move
            </DropdownItem>
          </li>
          <li>
            <span className="my-1.5 block h-px w-full bg-gray-200 dark:bg-[#353C49]"></span>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Delete
            </DropdownItem>
          </li>
        </ul>
      </Dropdown>
    </div>
  )
}
