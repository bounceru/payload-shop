// File: src/app/(dashboard)/dashboard/components/ui/CollectionShell.tsx
"use client";

import Link from "next/link";
import { useTheme } from "@/app/(dashboard)/dashboard/context/ThemeContext";

export function CollectionShell({
    title,
    description,
    createHref,
    children,
    createDisabled = false,
}: {
    title: string;
    description?: string;
    createHref?: string;
    children: React.ReactNode;
    createDisabled?: boolean;
}) {
    const { branding } = useTheme();
    const ctaColor = branding?.primaryColorCTA || "#ED6D38";

    return (
        <section className="w-full max-w-screen-xl mx-auto">
            {/* Header Section */}
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                        {description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
                        )}
                    </div>
                    {createHref && !createDisabled && (
                        <Link
                            href={createHref}
                            className="inline-block px-5 py-3 rounded-xl text-white text-sm font-semibold shadow hover:scale-105 transition"
                            style={{ backgroundColor: ctaColor }}
                        >
                            + Nieuw
                        </Link>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid gap-4">{children}</div>
        </section>
    );
}


// Usage example (in your page.tsx):
// <CollectionShell title="Events" createHref="/dashboard/events/new">
//   {events.map(...)}
// </CollectionShell>