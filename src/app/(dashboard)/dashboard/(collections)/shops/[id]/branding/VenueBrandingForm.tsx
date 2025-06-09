// File: src/app/(dashboard)/dashboard/(collections)/shops/[id]/(tabs)/venue-branding/VenueBrandingForm.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { FaTrash } from "react-icons/fa";

import MediaLibrary, { MediaDoc } from "@/app/(dashboard)/dashboard/components/shared/MediaLibrary";
import { DetailShell } from "@/app/(dashboard)/dashboard/components/ui/DetailShell";

interface ShopDoc {
    id?: string;
    name?: string;
    // ...
    tenant?: string | { id: string };
}

interface BrandingDoc {
    id?: string;
    tenant?: string | { id: string };
    shops?: string | { id: string };
    venueTitle?: string;
    siteLogo?: string | MediaDoc | null;
    siteFavicon?: string | MediaDoc | null;
    headerImage?: string | MediaDoc | null;
    headerBackgroundColor?: string;
    headerTextColor?: string;
    primaryColorCTA?: string;
    venueHeaderText?: string;
    venueIntroText?: string;
    // ...
}

export default function VenueBrandingForm({
    shop,
    branding,
}: {
    shop: ShopDoc;
    branding: BrandingDoc;
}) {
    const router = useRouter();

    const isNewBranding = (branding.id === "new");
    // Convert any "upload" fields from object => { id, s3_url }
    const initialBranding: BrandingDoc = sanitizeBranding(branding);

    // Local state
    const [tempBranding, setTempBranding] = useState<BrandingDoc>(initialBranding);
    const [isChanged, setIsChanged] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Media library modals
    const [showLogoLib, setShowLogoLib] = useState(false);
    const [showFaviconLib, setShowFaviconLib] = useState(false);
    const [showHeaderLib, setShowHeaderLib] = useState(false);

    // Compare for "Save" button
    useEffect(() => {
        const original = JSON.stringify(initialBranding);
        const current = JSON.stringify(tempBranding);
        setIsChanged(original !== current);
    }, [tempBranding, initialBranding]);

    // Helpers
    function setFieldValue<T extends keyof BrandingDoc>(field: T, value: BrandingDoc[T]) {
        setTempBranding((prev) => ({ ...prev, [field]: value }));
    }

    // SAVE => POST or PATCH to /api/payloadProxy/venue-branding
    async function handleSave() {
        const endpoint = "/api/payloadProxy/venue-branding";
        const method = isNewBranding ? "POST" : "PATCH";

        try {
            // Flatten references
            const body: any = { ...tempBranding };

            // Flatten tenant
            if (typeof body.tenant === "object" && body.tenant?.id) {
                body.tenant = body.tenant.id;
            }
            // Flatten shops
            if (typeof body.shops === "object" && body.shops?.id) {
                body.shops = body.shops.id;
            }
            // Flatten uploads
            ["siteLogo", "siteFavicon", "headerImage"].forEach((field) => {
                const val = body[field];
                if (val && typeof val === "object" && val.id) {
                    body[field] = val.id;
                } else if (!val) {
                    body[field] = null;
                }
            });

            // If updating
            if (!isNewBranding && body.id !== "new") {
                body.id = String(body.id);
            }

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                throw new Error("Failed to save branding");
            }
            const result = await res.json();
            const newID = result?.doc?.id || result.id;
            if (!newID) {
                throw new Error("No ID returned from server");
            }

            toast.success("Branding saved!");
            setIsChanged(false);

            if (isNewBranding) {
                // Once created, we can refresh or redirect
                router.refresh();
            } else {
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to save branding");
        }
    }

    // DELETE => only if not new
    async function handleDelete() {
        if (!tempBranding.id || tempBranding.id === "new") {
            toast.error("No ID to delete!");
            setShowDeleteModal(false);
            return;
        }
        try {
            const delURL = `/api/payloadProxy/venue-branding?id=${tempBranding.id}`;
            const res = await fetch(delURL, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Branding deleted!");
            // Return user to shops page or maybe to the tab
            router.back();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete branding");
        } finally {
            setShowDeleteModal(false);
        }
    }

    // Media library picks
    function handleSelectLogo(doc: MediaDoc) {
        setTempBranding((prev) => ({ ...prev, siteLogo: { id: doc.id, s3_url: doc.s3_url } }));
        setShowLogoLib(false);
    }
    function handleSelectFavicon(doc: MediaDoc) {
        setTempBranding((prev) => ({ ...prev, siteFavicon: { id: doc.id, s3_url: doc.s3_url } }));
        setShowFaviconLib(false);
    }
    function handleSelectHeader(doc: MediaDoc) {
        setTempBranding((prev) => ({ ...prev, headerImage: { id: doc.id, s3_url: doc.s3_url } }));
        setShowHeaderLib(false);
    }

    return (
        <>
            <Toaster position="top-center" />

            {/* Possibly a Delete confirm modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-md max-w-sm w-full space-y-4">
                        <h2 className="text-lg font-semibold">Delete Branding</h2>
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete the branding for{" "}
                            <strong>{tempBranding.venueTitle || shop.name}</strong>?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DetailShell
                title={`Branding: ${tempBranding.venueTitle || shop.name}`}
                description="Edit site visuals"
                onBack={() => router.back()}
                onDelete={!isNewBranding ? () => setShowDeleteModal(true) : undefined}
                onDeleteLabel="Delete Branding"
                onSave={handleSave}
                saveDisabled={!isChanged}
                saveLabel="Save Branding"
            >
                <div className="space-y-6">
                    {/* venueTitle */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Venue Title</label>
                        <input
                            className="border rounded p-2 w-full"
                            value={tempBranding.venueTitle || ""}
                            onChange={(e) => setFieldValue("venueTitle", e.target.value)}
                        />
                    </div>

                    {/* siteLogo */}
                    <MediaUploadField
                        label="Site Logo"
                        mediaValue={tempBranding.siteLogo}
                        onClickEdit={() => setShowLogoLib(true)}
                        onRemove={() => setFieldValue("siteLogo", null)}
                    />

                    {/* siteFavicon */}
                    <MediaUploadField
                        label="Favicon"
                        mediaValue={tempBranding.siteFavicon}
                        onClickEdit={() => setShowFaviconLib(true)}
                        onRemove={() => setFieldValue("siteFavicon", null)}
                    />

                    {/* headerImage */}
                    <MediaUploadField
                        label="Header Image"
                        mediaValue={tempBranding.headerImage}
                        onClickEdit={() => setShowHeaderLib(true)}
                        onRemove={() => setFieldValue("headerImage", null)}
                    />

                    {/* headerBackgroundColor */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Header Background Color</label>
                        <input
                            type="color"
                            className="w-12 h-8 p-1 border rounded"
                            value={tempBranding.headerBackgroundColor || "#ffffff"}
                            onChange={(e) => setFieldValue("headerBackgroundColor", e.target.value)}
                        />
                    </div>

                    {/* headerTextColor */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Header Text Color</label>
                        <input
                            type="color"
                            className="w-12 h-8 p-1 border rounded"
                            value={tempBranding.headerTextColor || "#000000"}
                            onChange={(e) => setFieldValue("headerTextColor", e.target.value)}
                        />
                    </div>

                    {/* primaryColorCTA */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Primary CTA Color</label>
                        <input
                            type="color"
                            className="w-12 h-8 p-1 border rounded"
                            value={tempBranding.primaryColorCTA || "#068b59"}
                            onChange={(e) => setFieldValue("primaryColorCTA", e.target.value)}
                        />
                    </div>

                    {/* venueHeaderText */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Header Text</label>
                        <input
                            className="border rounded p-2 w-full"
                            value={tempBranding.venueHeaderText || ""}
                            onChange={(e) => setFieldValue("venueHeaderText", e.target.value)}
                        />
                    </div>

                    {/* venueIntroText */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Intro Text</label>
                        <textarea
                            rows={3}
                            className="border w-full rounded p-2"
                            value={tempBranding.venueIntroText || ""}
                            onChange={(e) => setFieldValue("venueIntroText", e.target.value)}
                        />
                    </div>
                </div>
            </DetailShell>

            {/* Modals for picking media */}
            {showLogoLib && (
                <MediaLibrary
                    tenantID={typeof shop.tenant === "string" ? shop.tenant : shop.tenant?.id || ""}
                    isOpen
                    onClose={() => setShowLogoLib(false)}
                    onSelect={handleSelectLogo}
                    allowUpload
                />
            )}
            {showFaviconLib && (
                <MediaLibrary
                    tenantID={typeof shop.tenant === "string" ? shop.tenant : shop.tenant?.id || ""}
                    isOpen
                    onClose={() => setShowFaviconLib(false)}
                    onSelect={handleSelectFavicon}
                    allowUpload
                />
            )}
            {showHeaderLib && (
                <MediaLibrary
                    tenantID={typeof shop.tenant === "string" ? shop.tenant : shop.tenant?.id || ""}
                    isOpen
                    onClose={() => setShowHeaderLib(false)}
                    onSelect={handleSelectHeader}
                    allowUpload
                />
            )}
        </>
    );
}

/** Helper sub-component for repeated pattern of an "upload" with remove button. */
function MediaUploadField({
    label,
    mediaValue,
    onClickEdit,
    onRemove,
}: {
    label: string;
    mediaValue: string | MediaDoc | null | undefined;
    onClickEdit: () => void;
    onRemove: () => void;
}) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1">{label}</label>
            {mediaValue && typeof mediaValue === "object" && mediaValue.s3_url ? (
                <div className="relative w-48 h-32 border rounded flex items-center justify-center overflow-hidden">
                    <img
                        src={mediaValue.s3_url}
                        alt={label}
                        className="object-cover w-full h-full"
                    />
                    <button
                        onClick={onClickEdit}
                        className="absolute top-2 right-2 bg-white/80 px-2 py-1 rounded text-sm text-gray-600 hover:bg-white"
                    >
                        Change
                    </button>
                    <button
                        onClick={onRemove}
                        className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 rounded text-sm text-red-600 hover:bg-white"
                    >
                        <FaTrash />
                    </button>
                </div>
            ) : (
                <div
                    className="w-48 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 cursor-pointer"
                    onClick={onClickEdit}
                >
                    + Upload / Select
                </div>
            )}
        </div>
    );
}

/** If fields like siteLogo are objects, keep only {id, s3_url}. */
function sanitizeBranding(doc: BrandingDoc): BrandingDoc {
    const out = { ...doc };
    (["siteLogo", "siteFavicon", "headerImage"] as (keyof BrandingDoc)[]).forEach((field) => {
        const val = out[field];
        if (val && typeof val === "object") {
            out[field] = {
                id: (val as MediaDoc).id,
                s3_url: (val as MediaDoc).s3_url,
            } as any;
        }
    });
    return out;
}
