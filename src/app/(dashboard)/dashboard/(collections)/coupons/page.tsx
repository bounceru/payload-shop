import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { getPayload } from "payload"
import config from "@payload-config"

import { CollectionShell } from "@/app/(dashboard)/dashboard/components/ui/CollectionShell"
import CouponsTableClient from "./CouponsTableClient"

// If you have a global `Coupon` type
import type { Coupon } from "@/payload-types"

export const dynamic = "force-dynamic";

export default async function CouponsListPage() {
    // 1) read tenant from cookies if needed
    const cookieStore = await cookies();
    const tenantId = cookieStore.get("payload-tenant")?.value || "";

    // 2) create a "where" filter
    const where: any = {};
    if (tenantId) {
        where.tenant = { equals: tenantId };
    }

    // 3) fetch from Payload
    const payload = await getPayload({ config });
    const result = await payload.find({
        collection: "coupons",
        where,
        limit: 50,
        sort: "-createdAt",
        depth: 1, // or as needed
    });

    if (!result) {
        return notFound();
    }

    const coupons = result.docs as Coupon[];

    return (
        <CollectionShell
            title="Kortingscodes"
            description="Beheer van alle coupons."
            createHref="/dashboard/coupons/new"
        >
            {coupons.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                    Geen coupons gevonden.
                </div>
            ) : (
                <CouponsTableClient coupons={coupons} />
            )}
        </CollectionShell>
    );
}
