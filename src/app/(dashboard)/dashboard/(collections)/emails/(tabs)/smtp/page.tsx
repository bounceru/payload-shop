// File: src/app/(dashboard)/dashboard/(collections)/smtp-settings/page.tsx

import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

import { CollectionShell } from "@/app/(dashboard)/dashboard/components/ui/CollectionShell";
import SMTPTableClient from "./SMTPTableClient";

interface SMTPDoc {
    id: string;
    title: string;
    provider: string; // 'gmail' | 'outlook' | 'brevo' | 'orderapp' | 'custom'
    host?: string;
    port?: number;
    username?: string;
    fromName?: string;
    fromEmail?: string;
}

export const dynamic = "force-dynamic";

export default async function SMTPSettingsListPage() {
    // 1) Read tenant from cookies (if multi-tenant)
    const cookieStore = await cookies();
    const tenantId = cookieStore.get("payload-tenant")?.value || "";

    // 2) Build "where" filter
    const where: any = {};
    if (tenantId) {
        where.tenant = { equals: tenantId };
    }

    // 3) Fetch from Payload
    const payload = await getPayload({ config });
    const result = await payload.find({
        collection: "smtp-settings",
        where,
        limit: 50,
        sort: "-createdAt",
        depth: 1,
    });

    if (!result) {
        return notFound();
    }

    // 4) Convert docs to local type, ensuring fields are never null
    const safeSMTPs: SMTPDoc[] = result.docs.map((doc: any) => ({
        id: doc.id,
        title: doc.title || "(no title)",
        provider: doc.provider || "custom",
        host: doc.host || "",
        port: doc.port ?? undefined,
        username: doc.username || "",
        fromName: doc.fromName || "",
        fromEmail: doc.fromEmail || "",
    }));

    return (
        <CollectionShell
            title="SMTP Settings"
            description="Manage SMTP configurations."
            createHref="/dashboard/smtp-settings/new" // If you allow creation of new SMTP configs
        >
            {safeSMTPs.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                    No SMTP settings found.
                </div>
            ) : (
                <SMTPTableClient smtpConfigs={safeSMTPs} />
            )}
        </CollectionShell>
    );
}
