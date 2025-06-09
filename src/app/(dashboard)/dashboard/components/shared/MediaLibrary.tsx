// File: src/components/shared/MediaLibrary.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/app/(dashboard)/dashboard/components/ui/modal";
import DropzoneComponent from "@/app/(dashboard)/dashboard/components/form/form-elements/DropZone";
import SpinnerOne from "@/app/(dashboard)/dashboard/(admin)/(ui-elements)/spinners/SpinnerOne";

// Minimal type for media docs
export type MediaDoc = {
    id: string;
    s3_url?: string;
    alt_text?: string;
    filename?: string;
};

// ------------------------------------------
// PROPS
// ------------------------------------------
interface MediaLibraryProps {
    tenantID: string;            // needed to fetch media by tenant
    isOpen: boolean;             // show/hide modal
    onClose: () => void;         // user closed modal
    onSelect: (doc: MediaDoc) => void; // callback for chosen media doc
    allowUpload?: boolean;       // if true, show Dropzone + "Upload" button
}

// ------------------------------------------
// Single Media Card
// ------------------------------------------
function MediaFileCard({
    doc,
    onSelect,
    onDelete,
}: {
    doc: MediaDoc;
    onSelect: (doc: MediaDoc) => void;
    onDelete: (doc: MediaDoc) => void;
}) {
    return (
        <div
            className="
        relative flex flex-col gap-2
        rounded-lg border border-gray-200 bg-white p-3
        shadow-theme-xs hover:border-brand-300
        dark:border-gray-700 dark:bg-gray-900
      "
        >
            {/* Image thumbnail */}
            <div className="relative w-full flex-1">
                <img
                    src={doc.s3_url}
                    alt={doc.alt_text || doc.filename}
                    className="h-40 w-full object-contain"
                />
            </div>

            {/* Filename or alt text */}
            <p className="text-sm font-medium text-gray-800 dark:text-white/90 break-all">
                {doc.filename || doc.alt_text || "Untitled"}
            </p>

            {/* Buttons row */}
            <div className="flex items-center gap-2">
                {/* “Select” button */}
                <button
                    type="button"
                    onClick={() => onSelect(doc)}
                    className="
            inline-flex items-center justify-center rounded bg-[#1D2A36]
            px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1D2A36]
          "
                >
                    Selecteren
                </button>

                {/* Delete icon / button */}
                <button
                    type="button"
                    onClick={() => onDelete(doc)}
                    className="
            ml-auto inline-flex items-center justify-center rounded
            px-2 py-1 text-sm font-medium text-gray-500 hover:text-error-500
            dark:text-gray-400 dark:hover:text-error-400
          "
                    title="Delete media"
                >
                    <svg
                        className="h-5 w-5 fill-current"
                        viewBox="0 0 24 24"
                    >
                        <path d="M9 3a3 3 0 0 1 6 0v1h5.5a.5.5 0 0 1 0 1h-.55l-1.2 14.05A2.5 2.5 0 0 1 15.26 22H8.74a2.5 2.5 0 0 1-2.49-2.95L5.05 5H4.5a.5.5 0 0 1 0-1H9V3Zm1 1v1h4V4a2 2 0 1 0-4 0ZM6.26 19.01 7.45 5h9.1l1.19 14.01a1.5 1.5 0 0 1-1.49 1.77H8.74a1.5 1.5 0 0 1-1.48-1.77Z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ------------------------------------------
// MAIN COMPONENT
// ------------------------------------------
export default function MediaLibrary({
    tenantID,
    isOpen,
    onClose,
    onSelect,
    allowUpload = true,
}: MediaLibraryProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mediaItems, setMediaItems] = useState<MediaDoc[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // On open, fetch data
    useEffect(() => {
        if (isOpen && tenantID) {
            void fetchMedia();
        }
    }, [isOpen, tenantID]);

    // 1) GET existing media items
    async function fetchMedia() {
        try {
            setLoading(true);
            setError(null);

            const qs = new URLSearchParams();
            qs.set("limit", "0");
            qs.set("where[tenant][equals]", tenantID);

            const res = await fetch(`/api/media?${qs.toString()}`, {
                credentials: "include",
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch media: ${res.status}`);
            }

            const data = await res.json();
            setMediaItems(data.docs || []);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // 2) Called by Dropzone => /api/createMedia
    async function handleUploadFiles(files: File[]) {
        if (!tenantID) return;
        try {
            setLoading(true);

            // Upload each file
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("tenant", tenantID);

                // custom route:
                const res = await fetch("/api/payloadProxy/createMedia", {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                });
                if (!res.ok) {
                    throw new Error(`Failed uploading ${file.name}: ${res.status}`);
                }
                await res.json(); // you could store the doc here if you want
            }

            // re-fetch so user sees new items
            await fetchMedia();

            // optionally re-fetch again after a short delay
            setTimeout(() => {
                void fetchMedia();
            }, 1500);

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // 3) DELETE media item => call /api/media/:id with method=DELETE
    async function handleDeleteMedia(doc: MediaDoc) {
        const confirmed = window.confirm(`Delete media item "${doc.filename}"?`);
        if (!confirmed) return;

        try {
            setLoading(true);
            const res = await fetch(`/api/media/${doc.id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok && res.status !== 204) {
                throw new Error(`Failed deleting media: ${res.status}`);
            }
            // Once deleted, re-fetch
            await fetchMedia();
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // Filter items by search
    const filteredMedia = mediaItems.filter((m) =>
        (m.filename || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Prevent "Enter" from closing the modal inadvertently
    function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    }

    // ----------- RENDER -----------
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            isFullscreen={true} // Fullscreen
            showCloseButton={true}
        >
            {/* Outer container */}
            <div
                className="
          fixed inset-0
          flex flex-col
          bg-white dark:bg-gray-900
        "
            >
                {/* HEADER */}
                <div
                    className="
            flex items-center justify-between
            border-b border-gray-200 p-4
            dark:border-gray-700
          "
                >
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Media Library
                    </h2>
                </div>

                {/* CONTENT */}
                <div
                    className="
            flex-1 overflow-y-auto
            border-t border-gray-100 p-4 dark:border-gray-700
            sm:p-6
          "
                >
                    {error && (
                        <p className="mb-2 text-red-500">
                            {error}
                        </p>
                    )}

                    {/* Possibly show a Dropzone (only if allowUpload) */}
                    {allowUpload && (
                        <div className="mb-4">
                            <DropzoneComponent onDrop={(files) => handleUploadFiles(files)} />
                        </div>
                    )}

                    {/* Search bar */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            className="
                h-11 w-full rounded-lg border border-gray-300
                bg-transparent py-2.5 pl-[42px] pr-3.5 text-sm text-gray-800 shadow-theme-xs
                placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10
                dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30
                dark:focus:border-brand-800
              "
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                        <button
                            type="button"
                            className="
                absolute left-4 top-1/2 -translate-y-1/2 text-gray-500
                dark:text-gray-400
              "
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.945 18.5309 17.4703 18.2379 18.238L15.4178 15.4179C16.5359 14.0635 17.2087 12.3277 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* MAIN content => grid of existing media */}
                    {loading ? (
                        <div className="flex w-full justify-center py-4">
                            <SpinnerOne />
                        </div>
                    ) : (
                        <div
                            className="
                grid grid-cols-2 gap-4
                sm:grid-cols-3 sm:gap-6
                xl:grid-cols-4
              "
                        >
                            {filteredMedia.map((doc) => (
                                <MediaFileCard
                                    key={doc.id}
                                    doc={doc}
                                    onSelect={(selectedDoc) => {
                                        onSelect(selectedDoc);
                                        onClose();
                                    }}
                                    onDelete={handleDeleteMedia}
                                />
                            ))}

                            {!loading && filteredMedia.length === 0 && (
                                <p className="col-span-full text-sm text-gray-500 dark:text-gray-400">
                                    No media found.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );

    // ~~~~~

}
