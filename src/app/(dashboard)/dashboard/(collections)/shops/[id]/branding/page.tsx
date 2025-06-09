// File: src/app/(dashboard)/dashboard/(collections)/shops/[id]/(tabs)/venue-branding/page.tsx

import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

import { useShop } from "../shop-context"; // We'll use a small trick below
import VenueBrandingForm from "./VenueBrandingForm";
import { Shop } from "@/payload-types";

// This trick: we can't call `useShop()` in a server component, so let's do a small function
// that runs on the client side to read the shop context. But we do need the actual "shop" doc
// on the server side. So we rely on layout.tsx having loaded that doc already, then re-fetch.

export default async function VenueBrandingPage({
    params: promiseParams,
}: {
    /** Matches the seatMap approach: a *Promise* that eventually yields { id: string } */
    params: Promise<{ id: string }>;
}) {
    // 1) Wait for the 'params' promise, then extract 'id'
    const { id } = await promiseParams;

    if (id === "new") {
        // If the shop is "new", we can't brand it yet. You might redirect or show a message:
        return (
            <div className="p-4">
                <h2 className="text-xl font-semibold">No Branding Yet</h2>
                <p className="text-sm text-gray-500 mt-2">
                    Please create/save this shop first before editing branding.
                </p>
            </div>
        );
    }

    // 2) We have a shop loaded in the parent layout. Let's fetch it again from Payload (server side).
    const payload = await getPayload({ config });
    const cookieStore = await cookies();
    const tenantId = cookieStore.get("payload-tenant")?.value;

    // Load the shop doc
    const shop = await payload.findByID({
        collection: "shops",
        id,
        depth: 1,
    });
    if (!shop) {
        return notFound();
    }

    // Tenant check
    const shopTenant =
        typeof shop.tenant === "object" && shop.tenant !== null
            ? shop.tenant.id
            : shop.tenant;
    if (tenantId && shopTenant !== tenantId) {
        return notFound();
    }

    // 3) Find the existing VenueBranding doc for this shop (assuming 1:1)
    //    Because "shopsField" is presumably a relationship field named "shops" or similar:
    const brandResult = await payload.find({
        collection: "venue-branding",
        where: {
            tenant: { equals: shopTenant },
            shops: { equals: shop.id },
        },
        limit: 1,
        depth: 2,
    });

    let brandingDoc = brandResult.docs?.[0] || null;

    // If none found, we create a "blank" doc in memory referencing this shop
    if (!brandingDoc) {
        brandingDoc = {
            id: "new",
            tenant: shopTenant,
            shops: [shop.id],
            venueTitle: `${shop.name || "New Venue"}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

    // 4) Transform the doc's fields (like shops, siteLogo, etc.) for the form
    function fixMediaField(media: any): any {
        if (media && typeof media === "object" && "s3_url" in media && media.s3_url === null) {
            return { ...media, s3_url: undefined };
        }
        return media;
    }

    const brandingDocForForm = {
        ...brandingDoc,
        shops:
            Array.isArray(brandingDoc.shops) && brandingDoc.shops.length > 0
                ? typeof brandingDoc.shops[0] === "string"
                    ? brandingDoc.shops[0]
                    : { id: (brandingDoc.shops[0] as Shop).id }
                : undefined,
        siteLogo: fixMediaField(brandingDoc.siteLogo),
        siteFavicon: fixMediaField(brandingDoc.siteFavicon),
        headerImage: fixMediaField(brandingDoc.headerImage),
        headerBackgroundColor:
            brandingDoc.headerBackgroundColor ?? undefined,
        headerTextColor:
            brandingDoc.headerTextColor ?? undefined,
        primaryColorCTA:
            brandingDoc.primaryColorCTA ?? undefined,
        venueHeaderText:
            brandingDoc.venueHeaderText ?? undefined,
        venueIntroText:
            brandingDoc.venueIntroText ?? undefined,
    };

    // 5) Render the form
    return <VenueBrandingForm shop={shop} branding={brandingDocForForm} />;
}
