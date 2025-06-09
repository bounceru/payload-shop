"use client";

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/app/(dashboard)/dashboard/components/ui/table";

// Example icons (swap out if you like)
import FilterListIcon from "@mui/icons-material/FilterList";
// If you have a <Badge> or similar, import it
import Badge from "@/app/(dashboard)/dashboard/components/ui/badge/Badge";

interface EmailLogDoc {
    id: string;
    to?: string;
    from?: string;
    subject?: string;
    status?: string; // "pending" | "success" | "failed" | ...
    emailType?: string;
    errorMessage?: string;
    htmlBodySnippet?: string;
    createdAt?: string;
}

interface EmailLogsTableClientProps {
    logs: EmailLogDoc[];
}

export default function EmailLogsTableClient({ logs }: EmailLogsTableClientProps) {
    // Optional filters
    const [toFilter, setToFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");

    // Toggles for showing filter inputs
    const [showToFilter, setShowToFilter] = useState(false);
    const [showSubjectFilter, setShowSubjectFilter] = useState(false);
    const [showStatusFilter, setShowStatusFilter] = useState(false);

    // Filtering logic
    const filteredLogs = logs.filter((log) => {
        // "to" filter
        if (toFilter && !log.to?.toLowerCase().includes(toFilter.toLowerCase())) {
            return false;
        }
        // "subject" filter
        if (subjectFilter && !log.subject?.toLowerCase().includes(subjectFilter.toLowerCase())) {
            return false;
        }
        // "status" filter
        if (statusFilter && log.status !== statusFilter) {
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
                            {/* Recipient (to) */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 text-xs font-medium text-gray-500 text-start dark:text-gray-400"
                            >
                                <div className="flex items-center gap-1">
                                    To
                                    <button
                                        onClick={() => setShowToFilter((prev) => !prev)}
                                        className="text-gray-400 hover:text-gray-600 transition dark:hover:text-white"
                                        title="Filter by Recipient"
                                    >
                                        <FilterListIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                {showToFilter && (
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            value={toFilter}
                                            onChange={(e) => setToFilter(e.target.value)}
                                            className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                                            placeholder="Search by email..."
                                        />
                                    </div>
                                )}
                            </TableCell>

                            {/* Subject */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 text-xs font-medium text-gray-500 text-start dark:text-gray-400"
                            >
                                <div className="flex items-center gap-1">
                                    Subject
                                    <button
                                        onClick={() => setShowSubjectFilter((prev) => !prev)}
                                        className="text-gray-400 hover:text-gray-600 transition dark:hover:text-white"
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
                                className="px-5 py-3 text-xs font-medium text-gray-500 text-start dark:text-gray-400"
                            >
                                <div className="flex items-center gap-1">
                                    Status
                                    <button
                                        onClick={() => setShowStatusFilter((prev) => !prev)}
                                        className="text-gray-400 hover:text-gray-600 transition dark:hover:text-white"
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
                                            <option value="pending">Pending</option>
                                            <option value="success">Success</option>
                                            <option value="failed">Failed</option>
                                        </select>
                                    </div>
                                )}
                            </TableCell>

                            {/* CreatedAt */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 text-xs font-medium text-gray-500 text-start dark:text-gray-400"
                            >
                                Created At
                            </TableCell>

                            {/* ErrorMessage (or actions) */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 text-xs font-medium text-gray-500 text-start dark:text-gray-400"
                            >
                                Error
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {filteredLogs.map((log) => {
                            // Possibly show a color-coded badge for status
                            const statusColor =
                                log.status === "success" ? "success" :
                                    log.status === "failed" ? "error" :
                                        "warning"; // or "pending"

                            return (
                                <TableRow key={log.id}>
                                    {/* To */}
                                    <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                        {log.to}
                                    </TableCell>

                                    {/* Subject */}
                                    <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                        {log.subject || "(no subject)"}
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                        <Badge size="sm" color={statusColor}>
                                            {log.status}
                                        </Badge>
                                    </TableCell>

                                    {/* CreatedAt */}
                                    <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90 whitespace-nowrap">
                                        {log.createdAt
                                            ? new Date(log.createdAt).toLocaleString()
                                            : "-"}
                                    </TableCell>

                                    {/* ErrorMessage */}
                                    <TableCell className="px-5 py-4 text-sm text-red-600 max-w-xs truncate">
                                        {log.errorMessage || ""}
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {filteredLogs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="px-5 py-4 text-center text-gray-500">
                                    No email logs found (after filters).
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
