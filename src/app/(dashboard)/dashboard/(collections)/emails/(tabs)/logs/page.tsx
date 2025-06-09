// File: src/app/(dashboard)/dashboard/(collections)/email-logs/page.tsx

import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

import { CollectionShell } from "@/app/(dashboard)/dashboard/components/ui/CollectionShell";
import EmailLogsTableClient from "./EmailLogsTableClient";

/** Define a local type representing the shape your TableClient expects */
interface EmailLogDoc {
    id: string;
    to?: string;
    from?: string;
    subject?: string;
    status?: "pending" | "success" | "failed";
    emailType?: string;
    errorMessage?: string;
    htmlBodySnippet?: string;
    createdAt?: string; // if you want to display createdAt
}

/**
 * Next.js configuration:
 * - dynamic: "force-dynamic" => so it always fetches fresh data from Payload
 */
export const dynamic = "force-dynamic";

export default async function EmailLogsListPage() {
    // 1) Optionally read tenant from cookies for multi-tenant logic
    const cookieStore = await cookies();
    const tenantId = cookieStore.get("payload-tenant")?.value || "";

    // 2) Build a 'where' filter
    const where: any = {};
    if (tenantId) {
        where.tenant = { equals: tenantId };
    }

    // 3) Fetch from Payload
    const payload = await getPayload({ config });
    const result = await payload.find({
        collection: "email-logs",
        where,
        limit: 50,
        sort: "-createdAt", // newest first
        depth: 0, // usually no deep relationships needed, but adjust if you want
    });

    if (!result) {
        return notFound();
    }

    // 4) Convert docs into local type, ensuring no null issues
    const safeLogs: EmailLogDoc[] = result.docs.map((doc: any) => ({
        id: doc.id,
        to: doc.to || "",
        from: doc.from || "",
        subject: doc.subject || "",
        status: doc.status ?? "pending", // if null, fallback to "pending"
        emailType: doc.emailType || "custom",
        errorMessage: doc.errorMessage || "",
        htmlBodySnippet: doc.htmlBodySnippet || "",
        createdAt: doc.createdAt ?? undefined,
    }));

    return (
        <CollectionShell
            title="Email Logs"
            description="Overview of all email send attempts"
        // Typically, you don't create new logs by hand, so no createHref
        >
            {safeLogs.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                    No logs found.
                </div>
            ) : (
                <EmailLogsTableClient logs={safeLogs} />
            )}
        </CollectionShell>
    );
}
