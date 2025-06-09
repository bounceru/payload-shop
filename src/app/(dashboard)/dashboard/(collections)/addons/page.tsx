// File: src/app/(dashboard)/dashboard/(collections)/addons/page.tsx

import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { getPayload } from "payload"
import config from "@payload-config"

import { CollectionShell } from "@/app/(dashboard)/dashboard/components/ui/CollectionShell"
import AddonsTableClient from "./AddonsTableClient"

// If you have a global `Addon` type in payload-types:
import type { Addon } from "@/payload-types"

export const dynamic = "force-dynamic"

export default async function AddonsListPage() {
    // 1) Read tenant from cookies (if needed)
    const cookieStore = await cookies()
    const tenantId = cookieStore.get("payload-tenant")?.value || ""

    // 2) Build a where filter
    const where: any = {}
    if (tenantId) {
        where.tenant = { equals: tenantId }
    }

    // 3) Fetch from Payload
    const payload = await getPayload({ config })
    const result = await payload.find({
        collection: "addons",
        where,
        limit: 50,
        sort: "-createdAt", // or any field you'd prefer
        depth: 1,
    })
    if (!result) {
        return notFound()
    }

    const addons = result.docs as Addon[]

    return (
        <CollectionShell
            title="Extra Opties"
            description="Beheer van alle Add-Ons."
            createHref="/dashboard/addons/new"
        >
            {addons.length === 0 ? (
                <div className="text-center text-gray-500 py-12">Geen add-ons gevonden.</div>
            ) : (
                <AddonsTableClient addons={addons} />
            )}
        </CollectionShell>
    )
}
