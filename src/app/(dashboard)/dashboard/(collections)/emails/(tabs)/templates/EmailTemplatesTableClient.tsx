// File: src/app/(dashboard)/dashboard/(collections)/email-templates/EmailTemplatesTableClient.tsx

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
// If you use a Badge, import it, or remove if unnecessary
import Badge from "@/app/(dashboard)/dashboard/components/ui/badge/Badge";

interface EmailTemplateDoc {
    id: string;
    name: string;
    subject?: string;
    isPublic?: boolean;
}

interface EmailTemplatesTableClientProps {
    templates: EmailTemplateDoc[];
}

export default function EmailTemplatesTableClient({
    templates,
}: EmailTemplatesTableClientProps) {
    // Filter states
    const [nameFilter, setNameFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [isPublicFilter, setIsPublicFilter] = useState("");

    // Toggles for showing filter UI
    const [showNameFilter, setShowNameFilter] = useState(false);
    const [showSubjectFilter, setShowSubjectFilter] = useState(false);
    const [showPublicFilter, setShowPublicFilter] = useState(false);

    // Filter logic
    const filtered = templates.filter((tmpl) => {
        // 1) name substring
        if (
            nameFilter &&
            !tmpl.name.toLowerCase().includes(nameFilter.toLowerCase())
        ) {
            return false;
        }

        // 2) subject substring
        if (
            subjectFilter &&
            (!tmpl.subject || !tmpl.subject.toLowerCase().includes(subjectFilter.toLowerCase()))
        ) {
            return false;
        }

        // 3) isPublic => "", "true", "false"
        if (isPublicFilter === "true" && !tmpl.isPublic) return false;
        if (isPublicFilter === "false" && tmpl.isPublic) return false;

        return true;
    });

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
                                    Template Name
                                    <button
                                        onClick={() => setShowNameFilter((p) => !p)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                                        title="Filter by Name"
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
                                            placeholder="Search name..."
                                        />
                                    </div>
                                )}
                            </TableCell>

                            {/* Subject */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                            >
                                <div className="flex items-center gap-1">
                                    Subject
                                    <button
                                        onClick={() => setShowSubjectFilter((p) => !p)}
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

                            {/* isPublic */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                            >
                                <div className="flex items-center gap-1">
                                    Public?
                                    <button
                                        onClick={() => setShowPublicFilter((p) => !p)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                                        title="Filter by Public"
                                    >
                                        <FilterListIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                {showPublicFilter && (
                                    <div className="mt-2">
                                        <select
                                            className="w-full border border-gray-300 rounded px-1 py-1 text-xs"
                                            value={isPublicFilter}
                                            onChange={(e) => setIsPublicFilter(e.target.value)}
                                        >
                                            <option value="">--All--</option>
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                    </div>
                                )}
                            </TableCell>

                            {/* Actions column if you want to "View"/"Edit" links, etc. */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                            >
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {filtered.map((tmpl) => {
                            const publicColor = tmpl.isPublic ? "success" : "warning";
                            return (
                                <TableRow key={tmpl.id}>
                                    <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                        {tmpl.name}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                        {tmpl.subject || "(no subject)"}
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                        <Badge size="sm" color={publicColor}>
                                            {tmpl.isPublic ? "Yes" : "No"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                        {/* Example action link */}
                                        <a
                                            href={`/dashboard/email-templates/${tmpl.id}`}
                                            className="inline-block underline text-blue-600 hover:text-blue-800"
                                        >
                                            View
                                        </a>
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="px-5 py-4 text-center text-gray-500">
                                    No matching templates (after filters).
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
