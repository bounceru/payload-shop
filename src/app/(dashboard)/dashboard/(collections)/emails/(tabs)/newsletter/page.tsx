// File: src/app/(dashboard)/dashboard/(collections)/newsletters/page.tsx

import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

import { CollectionShell } from "@/app/(dashboard)/dashboard/components/ui/CollectionShell";
import NewslettersTableClient from "./NewslettersTableClient";

interface NewsletterDoc {
    id: string;
    subject: string;
    status: "draft" | "scheduled" | "sent";
    sendDate?: string; // date string if present
    audience: "all" | "tagged" | "event" | "manual";
    // Add other fields if you want to show them in the table
}

export const dynamic = "force-dynamic";

export default async function NewslettersListPage() {
    // 1) Read tenant from cookies if needed
    const cookieStore = await cookies();
    const tenantId = cookieStore.get("payload-tenant")?.value || "";

    // 2) Build 'where' filter
    const where: any = {};
    if (tenantId) {
        where.tenant = { equals: tenantId };
    }

    // 3) Fetch from Payload
    const payload = await getPayload({ config });
    const result = await payload.find({
        collection: "newsletters",
        where,
        limit: 50,
        sort: "-createdAt",
        depth: 1,
    });

    if (!result) {
        return notFound();
    }

    // 4) Map docs to local type and handle possible nulls
    const safeNewsletters: NewsletterDoc[] = result.docs.map((doc: any) => ({
        id: doc.id,
        subject: doc.subject || "(no subject)",
        status: doc.status ?? "draft",
        sendDate: doc.sendDate ?? undefined,
        audience: doc.audience ?? "all",
    }));

    return (
        <CollectionShell
            title="Newsletters"
            description="Manage your newsletter campaigns."
            createHref="/dashboard/newsletters/new" // If you allow creating new newsletters
        >
            {safeNewsletters.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                    No newsletters found.
                </div>
            ) : (
                <NewslettersTableClient newsletters={safeNewsletters} />
            )}
        </CollectionShell>
    );
}
