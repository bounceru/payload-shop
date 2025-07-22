'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Dropdown } from '../ui/dropdown/Dropdown'
import { DropdownItem } from '../ui/dropdown/DropdownItem'
import { ThemeToggleButton } from '../common/ThemeToggleButton'
import NotificationDropdown from './NotificationDropdown'
import { TenantSelectorClient } from '../TenantSelector/TenantSelector'
import { useTenant } from '../../context/TenantContext'
import { Pencil } from '../../icons/components'

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // Grab the user from TenantContext
  const { user } = useTenant()

  function toggleDropdown() {
    setIsOpen(!isOpen)
  }

  function closeDropdown() {
    setIsOpen(false)
  }

  // Sign‑out handler
  async function handleSignOut() {
    try {
      // 1) Ask server to clear the HTTP‑only payload‑token
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      // ignore – cookie will be gone anyway on 401 refresh
      console.warn('/api/users/logout failed', err)
    } finally {
      // 2) Clear tenant cookie (client‑side)
      document.cookie =
        'payload-tenant=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;'
      // 3) Redirect to sign‑in page (will also trigger server guard)
      router.push('/signin')
    }
  }

  const displayEmail = user?.email || 'unknown@example.com'
  const displayName = user?.username || displayEmail

  return (
    <div className="relative">
      {/* Avatar button */}
      <button
        onClick={toggleDropdown}
        className="dropdown-toggle flex items-center text-gray-700 "
      >
        <span className="mr-3 h-11 w-11 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
          <svg
            className="h-6 w-6 text-gray-500 dark:text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
        </span>
        <span className="mr-1 block text-theme-sm font-medium text-white">{displayName}</span>
        <svg
          className={`stroke-white-500 dark:stroke-white-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        {/* User info */}
        <div>
          <span className="block text-theme-sm font-medium text-gray-700 dark:text-gray-400">
            {displayName}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {displayEmail}
          </span>
        </div>

        <ul className="mb-3 mt-4 flex flex-col gap-1 border-b border-gray-200 pb-3 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-theme-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <Pencil className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
              Edit profile
            </DropdownItem>
          </li>
        </ul>

        {/* Mobile‑only extras */}
        <div className="block lg:hidden">
          <ul className="flex flex-col gap-3">
            <li>
              <TenantSelectorClient />
            </li>
            <li>
              <ThemeToggleButton />
            </li>
            <li>
              <NotificationDropdown />
            </li>
          </ul>
          <hr className="my-3 border-gray-200 dark:border-gray-700" />
        </div>

        {/* Sign‑out */}
        <button
          onClick={handleSignOut}
          className="group mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-theme-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          <svg
            className="fill-gray-500 group-hover:fill-gray-700"
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              d="M16 13v-2H7V9l-5 3 5 3v-2h9zm3-11H5c-1.1 0-2 .9-2 2v4h2V4h14v16H5v-4H3v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
          Sign out
        </button>
      </Dropdown>
    </div>
  )
}
