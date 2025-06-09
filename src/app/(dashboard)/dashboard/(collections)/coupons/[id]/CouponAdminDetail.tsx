"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

import { DetailShell } from "@/app/(dashboard)/dashboard/components/ui/DetailShell";
// Suppose you have a simple "Badge" or "Switch" if you want toggles
import Badge from "@/app/(dashboard)/dashboard/components/ui/badge/Badge";

// If you have a global `Coupon` type:
import type { Coupon } from "@/payload-types";

interface CouponAdminDetailProps {
    coupon: Partial<Coupon>;
    isNew?: boolean;
}

export default function CouponAdminDetail({
    coupon,
    isNew = false,
}: CouponAdminDetailProps) {
    const router = useRouter();

    // We'll keep local state for editing
    const [tempCoupon, setTempCoupon] = useState<Partial<Coupon>>(() => coupon);
    const [isChanged, setIsChanged] = useState(false);

    // Compare original vs current => toggles "Save" button
    useEffect(() => {
        const original = JSON.stringify(coupon);
        const current = JSON.stringify(tempCoupon);
        setIsChanged(original !== current);
    }, [tempCoupon, coupon]);

    // Helper to update a field
    function setFieldValue<T extends keyof Coupon>(field: T, value: Coupon[T]) {
        setTempCoupon((prev) => ({ ...prev, [field]: value }));
    }

    // Save => POST or PATCH
    async function handleSave() {
        try {
            const endpoint = "/api/payloadProxy/coupons";
            const isCreate = isNew || !tempCoupon.id;
            const method = isCreate ? "POST" : "PATCH";

            const body = { ...tempCoupon };

            // Flatten if needed (e.g. tenant as string).
            // If "id" is "new", remove it before sending
            if (!isCreate && body.id === "new") {
                delete body.id;
            }

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                throw new Error(`Coupon ${isCreate ? "creation" : "update"} failed.`);
            }
            toast.success("Coupon opgeslagen!");
            setIsChanged(false);

            const result = await res.json();
            if (isCreate) {
                const newID = result?.doc?.id || result.id;
                if (newID) {
                    router.push(`/dashboard/coupons/${newID}`);
                } else {
                    router.refresh();
                }
            } else {
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            toast.error("Opslaan mislukt.");
        }
    }

    // Delete => “DELETE /api/payloadProxy/coupons?id=xxx”
    async function handleDelete() {
        if (!tempCoupon.id || tempCoupon.id === "new") {
            toast.error("Geen ID om te verwijderen.");
            return;
        }
        try {
            const delUrl = `/api/payloadProxy/coupons?id=${tempCoupon.id}`;
            const res = await fetch(delUrl, { method: "DELETE" });
            if (!res.ok) {
                throw new Error("Verwijderen mislukt.");
            }
            toast.success("Coupon verwijderd!");
            router.push("/dashboard/coupons");
        } catch (err) {
            console.error(err);
            toast.error("Kon coupon niet verwijderen.");
        }
    }

    return (
        <DetailShell
            title={isNew ? "Nieuwe Coupon" : `Coupon: ${tempCoupon.code || ""}`}
            description="Beheer de velden van deze coupon."
            onBack={() => router.back()}
            onDelete={!isNew ? handleDelete : undefined}
            onDeleteLabel="Verwijderen"
            onSave={handleSave}
            saveLabel="Opslaan"
            saveDisabled={!isChanged}
        >
            <Toaster position="top-center" />
            {/* Basic fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* code */}
                <div>
                    <label className="block text-sm font-medium mb-1">Code</label>
                    <input
                        className="border rounded w-full p-2"
                        value={tempCoupon.code || ""}
                        onChange={(e) => setFieldValue("code", e.target.value)}
                    />
                </div>

                {/* discountType */}
                <div>
                    <label className="block text-sm font-medium mb-1">Type Korting</label>
                    <select
                        className="border rounded w-full p-2"
                        value={tempCoupon.discountType || "fixed"}
                        onChange={(e) => setFieldValue("discountType", e.target.value as "fixed" | "percentage")}
                    >
                        <option value="fixed">Vast (€)</option>
                        <option value="percentage">Percentage (%)</option>
                    </select>
                </div>

                {/* value */}
                <div>
                    <label className="block text-sm font-medium mb-1">Waarde</label>
                    <input
                        type="number"
                        step="0.01"
                        className="border rounded w-full p-2"
                        value={String(tempCoupon.value ?? 0)}
                        onChange={(e) => setFieldValue("value", parseFloat(e.target.value))}
                    />
                </div>

                {/* enabled */}
                <div className="flex items-center gap-2 mt-6">
                    <input
                        type="checkbox"
                        checked={tempCoupon.enabled ?? true}
                        onChange={(e) => setFieldValue("enabled", e.target.checked)}
                    />
                    <label className="text-sm">Actief</label>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                {/* validFrom */}
                <div>
                    <label className="block text-sm font-medium mb-1">Geldig vanaf</label>
                    <input
                        type="date"
                        className="border rounded w-full p-2"
                        value={tempCoupon.validFrom?.slice(0, 10) || ""}
                        onChange={(e) => setFieldValue("validFrom", e.target.value)}
                    />
                </div>

                {/* validUntil */}
                <div>
                    <label className="block text-sm font-medium mb-1">Geldig tot</label>
                    <input
                        type="date"
                        className="border rounded w-full p-2"
                        value={tempCoupon.validUntil?.slice(0, 10) || ""}
                        onChange={(e) => setFieldValue("validUntil", e.target.value)}
                    />
                </div>

                {/* usageLimit */}
                <div>
                    <label className="block text-sm font-medium mb-1">Gebruikslimiet</label>
                    <input
                        type="number"
                        className="border rounded w-full p-2"
                        value={String(tempCoupon.usageLimit ?? "")}
                        onChange={(e) => {
                            const val = e.target.value;
                            setFieldValue("usageLimit", val ? parseInt(val) : undefined);
                        }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {/* used (readOnly) */}
                <div>
                    <label className="block text-sm font-medium mb-1">Gebruikt (#)</label>
                    <input
                        type="number"
                        className="border rounded w-full p-2 bg-gray-50"
                        value={String(tempCoupon.used ?? 0)}
                        readOnly
                    />
                </div>

                {/* note */}
                <div>
                    <label className="block text-sm font-medium mb-1">Interne Notitie</label>
                    <textarea
                        className="border rounded w-full p-2"
                        rows={2}
                        value={tempCoupon.note || ""}
                        onChange={(e) => setFieldValue("note", e.target.value)}
                    />
                </div>
            </div>

            {/* Optionally: event + ticketType relationships here, if you want to show them. */}
            {/* e.g. <select> for event or ticketType? Up to you. */}
        </DetailShell>
    );
}
