// File: src/app/(dashboard)/dashboard/(collections)/email-templates/page.tsx

import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

import { CollectionShell } from "@/app/(dashboard)/dashboard/components/ui/CollectionShell";
import EmailTemplatesTableClient from "./EmailTemplatesTableClient";

// Define local shape that matches what we'll show in the table
interface EmailTemplateDoc {
    id: string;
    name: string;
    subject?: string;
    isPublic?: boolean;
}

export const dynamic = "force-dynamic";

export default async function EmailTemplatesListPage() {
    // 1) read tenant from cookies if needed
    const cookieStore = await cookies();
    const tenantId = cookieStore.get("payload-tenant")?.value || "";

    // 2) create "where" filter
    const where: any = {};
    if (tenantId) {
        where.tenant = { equals: tenantId };
    }

    // 3) fetch from Payload
    const payload = await getPayload({ config });
    const result = await payload.find({
        collection: "email-templates",
        where,
        limit: 50,
        sort: "-createdAt",
        depth: 1,
    });

    if (!result) {
        return notFound();
    }

    // 4) Convert docs => local shape
    const templates: EmailTemplateDoc[] = result.docs.map((doc: any) => ({
        id: doc.id,
        name: doc.name || "(untitled)",
        subject: doc.subject || "",
        isPublic: doc.isPublic || false,
    }));

    return (
        <CollectionShell
            title="Email Templates"
            description="Manage reusable email templates."
            createHref="/dashboard/email-templates/new"
        >
            {templates.length === 0 ? (
                <div className="text-center text-gray-500 py-12">No templates found.</div>
            ) : (
                <EmailTemplatesTableClient templates={templates} />
            )}
        </CollectionShell>
    );
}
