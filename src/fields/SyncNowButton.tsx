"use client";

import React, { useCallback, useState } from "react";
import { useWatchForm } from "@payloadcms/ui";

const SyncNowButton: React.FC = () => {
    const { getDataByPath } = useWatchForm();
    const [isSyncing, setIsSyncing] = useState(false);

    // Attempt to read the 'shop' relationship from this POS doc
    const shopValue = getDataByPath<any>("shop");

    const handleSyncClick = useCallback(async () => {
        try {
            console.log("[SyncNowButton] shopValue =>", shopValue);
            if (!shopValue) {
                alert("No shop selected for this POS config — cannot sync.");
                return;
            }

            setIsSyncing(true);

            // (1) Determine the shop ID
            let shopId: string;
            let shopSlug: string | undefined;

            if (typeof shopValue === "string") {
                shopId = shopValue;
            } else if (typeof shopValue === "object" && shopValue?.id) {
                shopId = shopValue.id;
                shopSlug = shopValue.slug;
            } else {
                throw new Error("Unable to read shop ID from relationship");
            }

            // (2) If we do NOT yet have a slug, fetch the shop doc
            if (!shopSlug) {
                console.log("[SyncNowButton] We only have an ID => fetching shop doc to get slug...");
                const shopRes = await fetch(`/api/shops/${shopId}?depth=0`, {
                    method: "GET",
                });
                if (!shopRes.ok) {
                    throw new Error(`Failed to fetch shop doc (status=${shopRes.status})`);
                }
                const shopDoc = await shopRes.json();
                shopSlug = shopDoc.slug;
            }

            if (!shopSlug) {
                throw new Error("Shop doc does not have a 'slug' field => cannot sync.");
            }

            // (3) Now call /api/syncPOS?host=theSlug
            const url = `/api/syncPOS?host=${encodeURIComponent(shopSlug)}`;
            const res = await fetch(url, { method: "GET" });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Sync request failed (status ${res.status})`);
            }

            // (4) success
            const data = await res.json();
            alert(`Sync succeeded: ${JSON.stringify(data)}`);
        } catch (err: any) {
            console.error(err);
            alert(`Sync failed: ${err.message || err}`);
        } finally {
            setIsSyncing(false);
        }
    }, [shopValue]);

    return (
        <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc" }}>
            <p>
                <strong>Manual Full Sync</strong>
            </p>
            <p>
                Click “Sync Now” to trigger a full sync of categories, products, and subproducts for this shop.
            </p>

            <button
                type="button"
                onClick={handleSyncClick}
                disabled={isSyncing}
                style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
            >
                {isSyncing ? "Syncing…" : "Sync Now"}
            </button>

            {/* Show indefinite progress bar if syncing */}
            {isSyncing && (
                <div style={{ marginTop: "1rem" }}>
                    <p>Sync in progress…</p>
                    <div
                        style={{
                            width: "100%",
                            height: "10px",
                            background: "#eee",
                            borderRadius: "4px",
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                background: "#0073e6",
                                borderRadius: "4px",
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SyncNowButton;
