"use client";

import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useTenant } from "../../context/TenantContext";

export function TenantSelectorClient() {
    const [isOpen, setIsOpen] = useState(false);

    const {
        user,
        isSuperAdmin,
        tenantOptions,
        selectedTenantId,
        setSelectedTenantId,
    } = useTenant();

    // Bail out if user data not ready
    if (!user) return null;

    // If not super admin & only 1 tenant, or if fewer than 2 options, hide
    const userTenantIDs =
        user?.tenants?.map((t: any) => t.tenant?.id || t.tenant) ?? [];
    const canShow =
        (isSuperAdmin || userTenantIDs.length > 1) && tenantOptions.length > 1;

    if (!canShow) return null;

    function toggleDropdown() {
        setIsOpen(!isOpen);
    }

    function closeDropdown() {
        setIsOpen(false);
    }

    function handleTenantChange(tenantValue: string) {
        setSelectedTenantId(tenantValue);
        closeDropdown();
    }

    // Display label for currently selected tenant
    const selectedLabel =
        tenantOptions.find((opt) => opt.value === selectedTenantId)?.label ||
        "Select Tenant";

    return (
        <div className="relative">
            {/* Button styled like the "Purchase Plan" snippet */}
            <button
                onClick={toggleDropdown}
                className="
          dropdown-toggle flex items-center justify-center
          rounded-lg bg-brand-500 p-3 text-theme-sm font-medium text-white
          hover:bg-brand-600
        "
            >
                <span className="mr-2">{selectedLabel}</span>
                <svg
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                    width="18"
                    height="20"
                    viewBox="0 0 18 20"
                    fill="none"
                >
                    <path
                        d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {/* The dropdown menu */}
            <Dropdown
                isOpen={isOpen}
                onClose={closeDropdown}
                className="
          absolute right-0 mt-2 flex w-[280px] flex-col
          rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg
          dark:border-gray-800 dark:bg-gray-dark
        "
            >
                <ul className="flex flex-col gap-1">
                    {tenantOptions.map((opt) => (
                        <li key={opt.value}>
                            <DropdownItem
                                onItemClick={() => handleTenantChange(opt.value)}
                                className="
                  group flex items-center gap-3 rounded-lg px-3 py-2
                  text-theme-sm font-medium text-gray-700
                  hover:bg-gray-100 hover:text-gray-700
                  dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300
                "
                            >
                                {opt.label}
                            </DropdownItem>
                        </li>
                    ))}
                </ul>
            </Dropdown>
        </div>
    );
}
