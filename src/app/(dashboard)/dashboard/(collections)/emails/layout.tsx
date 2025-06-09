// File: src/app/(dashboard)/dashboard/(collections)/emails/layout.tsx

import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";

// If you need a tenant check, do it here using cookies, payload, etc.
// Otherwise, just define your tabs and render children.

export default async function EmailsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Optionally, do some server-side checks here (like tenant verification).
    // For example:
    //
    // const tenantId = (await cookies()).get("payload-tenant")?.value;
    // if (!tenantId) return notFound();
    //
    // Then fetch or validate data as needed, just like your Shops layout.

    // Define your tabs for each email-related collection or feature
    const tabs = [
        { label: "Emails", path: "emails" },
        { label: "Email Templates", path: "templates" },
        { label: "Newsletter", path: "newsletter" },
        { label: "Email Logs", path: "logs" },
        { label: "SMTP", path: "smtp" },
    ];

    return (
        <div className="space-y-4">
            <div className="border-b border-gray-200 pb-2">
                <nav className="mt-2 flex gap-4">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.path}
                            href={`/dashboard/emails/${tab.path}`}
                            className="text-sm font-medium text-blue-600 hover:underline"
                        >
                            {tab.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Nested pages (the tab content) are rendered here */}
            <div>{children}</div>
        </div>
    );
}
