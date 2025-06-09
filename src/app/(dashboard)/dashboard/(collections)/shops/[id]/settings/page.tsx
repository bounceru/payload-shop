// File: src/app/(dashboard)/dashboard/(collections)/shops/[id]/(tabs)/settings/page.tsx

import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";

import EditShopClient from "./EditShopClient"; // <— our new client component

export default async function ShopSettingsPage({
    params: promiseParams,
}: {
    params: Promise<{ id: string }>; // matching your seatmap approach
}) {
    // 1) Wait for the promise to resolve => get the shop ID
    const { id } = await promiseParams;

    // 2) If "new", show a “new shop” placeholder or redirect
    if (id === "new") {
        return (
            <div className="p-4">
                <h2 className="text-xl font-semibold">Create a New Shop</h2>
                <p className="text-sm text-gray-600 mt-2">
                    This is where you'd render your "new shop" creation form, or redirect if needed.
                </p>
            </div>
        );
    }

    // 3) Fetch the doc from Payload
    const cookieStore = await cookies();
    const tenantId = cookieStore.get("payload-tenant")?.value;
    const payload = await getPayload({ config });

    const shop = await payload.findByID({
        collection: "shops",
        id,
        depth: 2,
    });

    if (!shop) {
        return notFound();
    }

    // 4) Tenant check
    const shopTenant =
        typeof shop.tenant === "object" && shop.tenant !== null
            ? shop.tenant.id
            : shop.tenant;

    if (tenantId && shopTenant !== tenantId) {
        return notFound();
    }

    // 5) Pass the fetched doc into our client component
    // Ensure slug is never null
    const safeShop = {
        ...shop,
        slug: shop.slug === null ? undefined : shop.slug,
        showExceptionallyClosedDaysOnOrderPage:
            shop.showExceptionallyClosedDaysOnOrderPage === null
                ? undefined
                : shop.showExceptionallyClosedDaysOnOrderPage,
        exceptionally_closed_days:
            shop.exceptionally_closed_days === null
                ? undefined
                : (shop.exceptionally_closed_days ?? []).map((day: any) => ({
                    ...day,
                    id: day.id === null ? undefined : day.id,
                    reason: day.reason === null ? undefined : day.reason,
                })),
        address: shop.address === null ? undefined : shop.address,
        location:
            shop.location === null || shop.location === undefined
                ? undefined
                : {
                    lat: shop.location.lat === null ? undefined : shop.location.lat,
                    lng: shop.location.lng === null ? undefined : shop.location.lng,
                },
        company_details: {
            ...shop.company_details,
            contact_email:
                shop.company_details?.contact_email === null
                    ? undefined
                    : shop.company_details?.contact_email,
            phone:
                shop.company_details?.phone === null
                    ? undefined
                    : shop.company_details?.phone,
            street:
                shop.company_details?.street === null
                    ? undefined
                    : shop.company_details?.street,
            house_number:
                shop.company_details?.house_number === null
                    ? undefined
                    : shop.company_details?.house_number,
            city:
                shop.company_details?.city === null
                    ? undefined
                    : shop.company_details?.city,
            postal:
                shop.company_details?.postal === null
                    ? undefined
                    : shop.company_details?.postal,
            vat_nr:
                shop.company_details?.vat_nr === null
                    ? undefined
                    : shop.company_details?.vat_nr,
            website_url:
                shop.company_details?.website_url === null
                    ? undefined
                    : shop.company_details?.website_url,
        },
    };
    return <EditShopClient serverShop={safeShop} />;
}
