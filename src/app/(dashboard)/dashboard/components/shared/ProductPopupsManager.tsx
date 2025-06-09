"use client";

import React, { useEffect, useState } from "react";
import Button from "../ui/button/Button";

import {
    DndContext,
    DragEndEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useTranslation } from "@/context/TranslationsContext";

/** 
 * Represents one “popup” assignment in either a Product or a Category:
 * We add `order?: number` so it won’t break if categories never set it.
 */
export type PopupAssignment = {
    popup: string;   // The popup doc’s ID
    order?: number;  // Optional sort order (for products)
};

/** A minimal doc shape for the actual popup. 
 *  Both product-popups and category-popups can share 
 *  the same shape or you can expand if they differ. 
 */
type PopupDoc = {
    id: string;
    popup_title_nl: string;
    internal_name?: string;
};

/** Props for the PopupsManager. */
interface PopupsManagerProps {
    /** The current tenant ID. */
    tenantID: string;

    /** 
     * An array of assigned popups => 
     *   { popup: 'somePopupID', order?: number }
     */
    value: PopupAssignment[];

    /** 
     * Called whenever the assigned array changes (add, remove, reorder). 
     */
    onChange: (newValue: PopupAssignment[]) => void;

    /**
     * If you need to differentiate category vs product usage,
     * pass a `collectionType` or a direct `fetchUrl`.
     * Example: 
     *   collectionType="category" => /api/categorypopups
     *   collectionType="product"  => /api/productpopups
     */
    collectionType?: "category" | "product";
}

/** One row in the drag‑and‑drop list. */
function SortablePopupRow({
    popupItem,
    index,
    availablePopups,
    removePopup,
}: {
    popupItem: PopupAssignment;
    index: number;
    availablePopups: PopupDoc[];
    removePopup: (index: number) => void;
}) {
    const { t } = useTranslation();
    const rowKey = `popupRow-${index}`;

    // Resolve popup label
    const matchedDoc = availablePopups.find((p) => p.id === popupItem.popup);
    const label = matchedDoc ? matchedDoc.popup_title_nl : t("popups.unknownPopup");

    // dnd‑kit
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: rowKey });

    const rowStyle: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        touchAction: "none", // stops “scroll vs drag” fights on touch
    };

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={rowStyle}
            className="
        mb-2 flex items-center justify-between gap-3 rounded border p-2
        cursor-grab active:cursor-grabbing
        border-gray-300 bg-white hover:bg-gray-50
        dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/70
      "
        >
            {/* left: icon + label */}
            <div className="flex items-center gap-3">
                <span className="text-gray-400 dark:text-gray-400">
                    {/* 4‑direction arrow icon */}
                    <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M5 9l-3 3 3 3" />
                        <path d="M9 5l3-3 3 3" />
                        <path d="M15 19l-3 3-3-3" />
                        <path d="M19 9l3 3-3 3" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <line x1="12" y1="2" x2="12" y2="22" />
                    </svg>
                </span>

                <p className="min-w-[150px] text-sm text-gray-800 dark:text-white/90">
                    {label}
                </p>
            </div>

            {/* right: delete (stopPropagation => never starts drag) */}
            <div onMouseDown={(e) => e.stopPropagation()}>
                <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => removePopup(index)}
                >
                    {t("dashboard.remove")}
                </Button>
            </div>
        </div>
    );
}

/**
 * A generic “Popups Manager” that can be used by either
 * Categories or Products. You control which “popups” we fetch
 * by passing `collectionType="category"` or `"product"`.
 */
export default function PopupsManager({
    tenantID,
    value,
    onChange,
    collectionType = "category", // default for backward compat
}: PopupsManagerProps) {
    const { t } = useTranslation();
    const [availablePopups, setAvailablePopups] = useState<PopupDoc[]>([]);
    const [error, setError] = useState<string | null>(null);

    // State for the "Add Popup" modal
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 180, tolerance: 6 },
        })
    );

    /** 1) Fetch popups from either /api/productpopups or /api/categorypopups. */
    useEffect(() => {
        if (tenantID) {
            void fetchPopups(tenantID, collectionType);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantID, collectionType]);

    async function fetchPopups(tID: string, cType: "category" | "product") {
        try {
            let endpoint = "/api/productpopups";
            if (cType === "product") {
                endpoint = "/api/productpopups";
            }

            const qs = new URLSearchParams();
            qs.set("limit", "0");
            qs.set("depth", "1");
            qs.set("where[tenant][equals]", tID);

            const res = await fetch(`${endpoint}?${qs.toString()}`, {
                credentials: "include",
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch popups: ${res.status}`);
            }
            const data = await res.json();
            if (data.docs) {
                setAvailablePopups(data.docs as PopupDoc[]);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        }
    }

    /** 2) Add a new assigned popup => update parent array. */
    function addPopup(popupID: string) {
        if (!popupID) return;
        // No duplicates
        const alreadyExists = value.some((item) => item.popup === popupID);
        if (alreadyExists) {
            alert(t("popups.popupAlreadyAssigned"));
            return;
        }
        onChange([...value, { popup: popupID }]);
    }

    /** 3) Remove assigned popup. */
    function removePopup(index: number) {
        const updated = [...value];
        updated.splice(index, 1);
        onChange(updated);
    }

    /** 4) Reorder via drag + drop. (DnDKit) */
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = parseInt(String(active.id).replace("popupRow-", ""), 10);
        const newIndex = parseInt(String(over.id).replace("popupRow-", ""), 10);

        const updated = [...value];
        const [moved] = updated.splice(oldIndex, 1);
        updated.splice(newIndex, 0, moved);
        onChange(updated);
    }

    // Filter availablePopups by searchTerm
    const filteredPopups = availablePopups.filter((p) => {
        const term = searchTerm.toLowerCase();
        return (
            p.popup_title_nl?.toLowerCase().includes(term) ||
            p.internal_name?.toLowerCase().includes(term)
        );
    });

    return (
        <div>
            {/* The assigned popups => DnD list */}
            <div className="mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("dashboard.dragText")}
                </p>
            </div>

            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext
                    items={value.map((_, i) => `popupRow-${i}`)}
                    strategy={verticalListSortingStrategy}
                >
                    {value.map((popupItem, index) => (
                        <SortablePopupRow
                            key={`popupRow-${index}`}
                            popupItem={popupItem}
                            index={index}
                            availablePopups={availablePopups}
                            removePopup={removePopup}
                        />
                    ))}
                </SortableContext>
            </DndContext>

            <div className="mt-4 flex justify-start">
                {/* "Add Popup" => show the modal */}
                <Button
                    size="sm"
                    type="button"
                    onClick={() => {
                        setSearchTerm("");
                        setShowModal(true);
                    }}
                >
                    {t("dashboard.addPopup")}
                </Button>
            </div>

            {error && (
                <p className="mt-2 text-sm text-error-500 dark:text-error-400">
                    {error}
                </p>
            )}

            {/* The "Add Popup" modal => separate overlay */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className={
                            "mx-4 max-h-[80vh] w-full max-w-md overflow-auto rounded bg-white p-4 " +
                            "shadow-xl dark:bg-gray-800 dark:text-white/90"
                        }
                        onClick={(e) => e.stopPropagation()} // also stopPropagation
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                {t("dashboard.selectPopup")}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                aria-label={t("dashboard.close")}
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Search bar */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder={t("dashboard.searchPlaceholder") as string}
                                className={
                                    "w-full rounded border border-gray-300 px-3 py-2 text-sm " +
                                    "focus:outline-none focus:ring-1 focus:ring-brand-500 " +
                                    "dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                                }
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                // Prevent pressing Enter from submitting any parent form
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </div>

                        <div>
                            {filteredPopups.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("dashboard.noPopupsFound")}
                                </p>
                            )}
                            {filteredPopups.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => {
                                        addPopup(p.id);
                                        setShowModal(false);
                                    }}
                                    className={
                                        "mb-2 cursor-pointer rounded border border-transparent px-3 py-2 " +
                                        "hover:border-brand-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }
                                >
                                    <p className="font-medium text-gray-800 dark:text-white/90">
                                        {p.popup_title_nl}
                                    </p>
                                    {p.internal_name && (
                                        <p className="text-sm text-gray-400 dark:text-gray-500">
                                            {p.internal_name}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
