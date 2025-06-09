// File: src/app/(dashboard)/dashboard/(collections)/shops/[id]/page.tsx

import { redirect } from "next/navigation";

/**
 * This matches the pattern from your seatmaps example:
 *   params: Promise<{ id: string }>
 * and we use `await promiseParams` to get the ID.
 */
export default async function ShopDefaultRedirect({
    params: promiseParams,
}: {
    params: Promise<{ id: string }>;
}) {
    // 1) Await the promise to get { id }
    const { id } = await promiseParams;

    // 2) If “new”, you might do something else. Otherwise, redirect
    redirect(`/dashboard/shops/${id}/settings`);
}
