"use client";

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/app/(dashboard)/dashboard/components/ui/table";
import FilterListIcon from "@mui/icons-material/FilterList";

interface SMTPDoc {
    id: string;
    title: string;
    provider: string;
    host?: string;
    port?: number;
    username?: string;
    fromName?: string;
    fromEmail?: string;
}

interface SMTPTableClientProps {
    smtpConfigs: SMTPDoc[];
}

export default function SMTPTableClient({ smtpConfigs }: SMTPTableClientProps) {
    // Local filter states
    const [titleFilter, setTitleFilter] = useState("");
    const [providerFilter, setProviderFilter] = useState("");

    // Toggles for showing filter inputs
    const [showTitleFilter, setShowTitleFilter] = useState(false);
    const [showProviderFilter, setShowProviderFilter] = useState(false);

    // Filter logic
    const filtered = smtpConfigs.filter((smtp) => {
        // 1) Title substring
        if (
            titleFilter &&
            !smtp.title.toLowerCase().includes(titleFilter.toLowerCase())
        ) {
            return false;
        }
        // 2) Provider exact match
        if (providerFilter && smtp.provider !== providerFilter) {
            return false;
        }
        return true;
    });

    return (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            {/* Title (Friendly Name) */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-xs text-gray-500 dark:text-gray-400"
                            >
                                <div className="flex items-center gap-1">
                                    Title
                                    <button
                                        onClick={() => setShowTitleFilter((prev) => !prev)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                                        title="Filter by Title"
                                    >
                                        <FilterListIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                {showTitleFilter && (
                                    <div className="mt-2">
                                        <input
                                            className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                                            type="text"
                                            value={titleFilter}
                                            onChange={(e) => setTitleFilter(e.target.value)}
                                            placeholder="Search title..."
                                        />
                                    </div>
                                )}
                            </TableCell>

                            {/* Provider */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-xs text-gray-500 dark:text-gray-400"
                            >
                                <div className="flex items-center gap-1">
                                    Provider
                                    <button
                                        onClick={() => setShowProviderFilter((prev) => !prev)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                                        title="Filter by Provider"
                                    >
                                        <FilterListIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                {showProviderFilter && (
                                    <div className="mt-2">
                                        <select
                                            className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                                            value={providerFilter}
                                            onChange={(e) => setProviderFilter(e.target.value)}
                                        >
                                            <option value="">--All--</option>
                                            <option value="gmail">Gmail</option>
                                            <option value="outlook">Outlook</option>
                                            <option value="brevo">Brevo</option>
                                            <option value="orderapp">Orderapp</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                    </div>
                                )}
                            </TableCell>

                            {/* Host */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-xs text-gray-500 dark:text-gray-400"
                            >
                                Host
                            </TableCell>

                            {/* Port */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-xs text-gray-500 dark:text-gray-400"
                            >
                                Port
                            </TableCell>

                            {/* Username */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-xs text-gray-500 dark:text-gray-400"
                            >
                                Username
                            </TableCell>

                            {/* FromName */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-xs text-gray-500 dark:text-gray-400"
                            >
                                From Name
                            </TableCell>

                            {/* FromEmail */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-xs text-gray-500 dark:text-gray-400"
                            >
                                From Email
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {filtered.map((smtp) => (
                            <TableRow key={smtp.id}>
                                <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                    {smtp.title}
                                </TableCell>
                                <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90 capitalize">
                                    {smtp.provider}
                                </TableCell>
                                <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                    {smtp.host || "-"}
                                </TableCell>
                                <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                    {smtp.port ?? "-"}
                                </TableCell>
                                <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                    {smtp.username || "-"}
                                </TableCell>
                                <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                    {smtp.fromName || "-"}
                                </TableCell>
                                <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                    {smtp.fromEmail || "-"}
                                </TableCell>
                            </TableRow>
                        ))}

                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="px-5 py-4 text-center text-gray-500">
                                    No SMTP configurations found (after filters).
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
