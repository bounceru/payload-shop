"use client"

import React, { useState } from "react"
import Link from "next/link"

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/app/(dashboard)/dashboard/components/ui/table"
import Badge from "@/app/(dashboard)/dashboard/components/ui/badge/Badge"

// Example icons from MUI or your own
import FilterListIcon from "@mui/icons-material/FilterList"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"

// If you have a global `Addon` type:
import type { Addon } from "@/payload-types"

interface AddonsTableClientProps {
    addons: Addon[]
}

export default function AddonsTableClient({ addons }: AddonsTableClientProps) {
    // Local states for filtering
    const [nameFilter, setNameFilter] = useState("")
    const [priceFilter, setPriceFilter] = useState("")
    const [availableFilter, setAvailableFilter] = useState("")
    const [isPerTicketFilter, setIsPerTicketFilter] = useState("")

    // Toggles for showing/hiding each column’s filter
    const [showNameFilter, setShowNameFilter] = useState(false)
    const [showPriceFilter, setShowPriceFilter] = useState(false)
    const [showAvailableFilter, setShowAvailableFilter] = useState(false)
    const [showPerTicketFilter, setShowPerTicketFilter] = useState(false)

    // Simple client‐side filtering
    const filteredAddons = addons.filter((addon) => {
        // 1) Filter by name
        if (nameFilter && !addon.name.toLowerCase().includes(nameFilter.toLowerCase())) {
            return false
        }
        // 2) Filter by price (string includes check, or parse float?)
        if (priceFilter) {
            const priceStr = String(addon.price ?? 0)
            if (!priceStr.includes(priceFilter)) {
                return false
            }
        }
        // 3) Filter by available? availableFilter = "", "true", "false"
        if (availableFilter === "true" && !addon.available) return false
        if (availableFilter === "false" && addon.available) return false
        // 4) Filter by isPerTicket? isPerTicketFilter = "", "true", "false"
        if (isPerTicketFilter === "true" && !addon.isPerTicket) return false
        if (isPerTicketFilter === "false" && addon.isPerTicket) return false

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
                                            placeholder="Zoek naam..."
                                        />
                                    </div>
                                )}
                            </TableCell>

                            {/* Price */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                            >
                                <div className="flex items-center gap-1">
                                    Prijs (€)
                                    <button
                                        onClick={() => setShowPriceFilter((prev) => !prev)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                                        title="Filter"
                                    >
                                        <FilterListIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                {showPriceFilter && (
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            value={priceFilter}
                                            onChange={(e) => setPriceFilter(e.target.value)}
                                            className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                                            placeholder="Zoek prijs..."
                                        />
                                    </div>
                                )}
                            </TableCell>

                            {/* Available */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                            >
                                <div className="flex items-center gap-1">
                                    Beschikbaar?
                                    <button
                                        onClick={() => setShowAvailableFilter((prev) => !prev)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                                        title="Filter"
                                    >
                                        <FilterListIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                {showAvailableFilter && (
                                    <div className="mt-2">
                                        <select
                                            className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                                            value={availableFilter}
                                            onChange={(e) => setAvailableFilter(e.target.value)}
                                        >
                                            <option value="">--Alle--</option>
                                            <option value="true">Ja</option>
                                            <option value="false">Nee</option>
                                        </select>
                                    </div>
                                )}
                            </TableCell>

                            {/* isPerTicket */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                            >
                                <div className="flex items-center gap-1">
                                    Per Ticket?
                                    <button
                                        onClick={() => setShowPerTicketFilter((prev) => !prev)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                                        title="Filter"
                                    >
                                        <FilterListIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                {showPerTicketFilter && (
                                    <div className="mt-2">
                                        <select
                                            className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                                            value={isPerTicketFilter}
                                            onChange={(e) => setIsPerTicketFilter(e.target.value)}
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
                        {filteredAddons.map((addon) => {
                            // We'll create a small badge for available or not
                            const availableColor: "success" | "error" = addon.available ? "success" : "error"
                            const availableLabel = addon.available ? "Ja" : "Nee"
                            const perTicketLabel = addon.isPerTicket ? "Ja" : "Nee"

                            return (
                                <TableRow key={addon.id}>
                                    <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                        {addon.name}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                        €{addon.price?.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                        <Badge size="sm" color={availableColor}>
                                            {availableLabel}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                        {perTicketLabel}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                        <Link
                                            href={`/dashboard/addons/${addon.id}`}
                                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition"
                                            title="Bekijk Add-On"
                                        >
                                            <VisibilityOutlinedIcon fontSize="small" />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            )
                        })}

                        {filteredAddons.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="px-5 py-4 text-center text-gray-500">
                                    Geen add-ons gevonden (na filter).
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
