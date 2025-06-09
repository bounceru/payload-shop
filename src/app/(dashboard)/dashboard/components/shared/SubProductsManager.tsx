// File: src/app/(dashboard)/dashboard/components/shared/SubProductsManager.tsx
"use client";

import React, { useEffect, useState } from "react";
import Button from "../../components/ui/button/Button";

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

/** A single assigned item in your array: subproduct ID + isDefault. */
export type AssignedSubproductItem = {
    /** The ID of a subproduct doc */
    subproduct: string;
    /** True if this item is the “default checked” subproduct (0 or 1 total). */
    isDefault?: boolean;
};

/** Minimal shape for subproduct docs from your API. Adjust fields as needed. */
type SubproductDoc = {
    id: string;
    name_nl: string;
    internal_name?: string;
};

/** Props for <SubProductsManager>. */
interface SubProductsManagerProps {
    /** Current tenant ID for fetching subproducts. */
    tenantID: string;
    /** The assigned array => subproduct IDs + isDefault flags. */
    value: AssignedSubproductItem[];
    /** Called whenever the assigned array changes (reorder, add, remove, or default changed). */
    onChange: (newValue: AssignedSubproductItem[]) => void;
}

/**
 * One row in the DnD list:
 *  - Draggable handle
 *  - Subproduct name
 *  - Button to (un)set default
 *  - A "Remove" button
 */
function SortableSubproductRow({
    item,
    index,
    allDocs,
    onRemove,
    onSetDefault,
    onUnsetDefault,
}: {
    item: AssignedSubproductItem;
    index: number;
    allDocs: SubproductDoc[];
    onRemove: (index: number) => void;
    onSetDefault: (index: number) => void;
    onUnsetDefault: (index: number) => void;
}) {
    const { t } = useTranslation();
    const rowKey = `subRow-${index}`;

    // Find doc label
    const matched = allDocs.find((d) => d.id === item.subproduct);
    const label = matched
        ? matched.name_nl || matched.internal_name || matched.id
        : t("dashboard.unknownSubproduct");

    // dnd-kit
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: rowKey });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.75 : 1,
        touchAction: "none",
    };

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={style}
            className="
        mb-2 flex items-center justify-between gap-3 rounded border p-2
        cursor-grab active:cursor-grabbing
        border-gray-300 bg-white hover:bg-gray-50
        dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/70
      "
        >
            {/* Left: drag icon + name */}
            <div className="flex items-center gap-3">
                <span className="text-gray-400 dark:text-gray-400">
                    {/* 4-direction drag handle icon */}
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
                <p className="min-w-[140px] text-sm text-gray-800 dark:text-white/90">{label}</p>
            </div>



            {/* Right: remove */}
            <div className="flex flex-row gap-1" onMouseDown={(e) => e.stopPropagation()}>
                {item.isDefault ? (
                    <Button variant="outline" size="sm" onClick={() => onUnsetDefault(index)}>
                        {t("dashboard.unsetDefault")}
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" onClick={() => onSetDefault(index)}>
                        {t("dashboard.setDefault")}
                    </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => onRemove(index)}>
                    {t("dashboard.remove")}
                </Button>
            </div>
        </div>
    );
}

/**
 * The main manager:
 *  - Fetches subproducts from `/api/subproducts?where[tenant]=...`
 *  - DnD list to reorder assigned items
 *  - "Set Default" button => sets that item’s isDefault = true, clears others
 *  - "Unset Default" button => clears that item’s isDefault => no default
 *  - "Add" => user can pick new subproduct from search => appended
 */
export default function SubProductsManager({
    tenantID,
    value,
    onChange,
}: SubProductsManagerProps) {
    const { t } = useTranslation();

    // Fetched subproducts
    const [allSubDocs, setAllSubDocs] = useState<SubproductDoc[]>([]);
    const [error, setError] = useState<string | null>(null);

    // "Add" modal
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // dnd-kit sensors
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } })
    );

    /** Fetch subproducts for the tenant. */
    useEffect(() => {
        if (tenantID) {
            void fetchSubproducts(tenantID);
        }
    }, [tenantID]);

    async function fetchSubproducts(tID: string) {
        try {
            const qs = new URLSearchParams();
            qs.set("limit", "0");
            qs.set("depth", "1");
            qs.set("where[tenant][equals]", tID);

            const res = await fetch(`/api/subproducts?${qs.toString()}`, {
                credentials: "include",
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch subproducts: ${res.status}`);
            }
            const data = await res.json();
            if (data.docs) {
                setAllSubDocs(data.docs as SubproductDoc[]);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        }
    }

    // 1) Add
    function addSubproduct(subId: string) {
        const already = value.some((item) => item.subproduct === subId);
        if (already) {
            alert(t("dashboard.alreadyAssignedSubproduct"));
            return;
        }
        onChange([...value, { subproduct: subId, isDefault: false }]);
    }

    // 2) Remove
    function removeSubproduct(index: number) {
        const updated = [...value];
        updated.splice(index, 1);
        onChange(updated);
    }

    // 3) Reorder
    function handleDragEnd(e: DragEndEvent) {
        const { active, over } = e;
        if (!over || active.id === over.id) return;

        const oldIndex = parseInt(String(active.id).replace("subRow-", ""), 10);
        const newIndex = parseInt(String(over.id).replace("subRow-", ""), 10);

        const updated = [...value];
        const [moved] = updated.splice(oldIndex, 1);
        updated.splice(newIndex, 0, moved);
        onChange(updated);
    }

    // 4a) Set default => clear isDefault on others
    function handleSetDefault(index: number) {
        const updated = value.map((item, i) =>
            i === index
                ? { ...item, isDefault: true }
                : { ...item, isDefault: false }
        );
        onChange(updated);
    }

    // 4b) Unset => set isDefault = false on that item
    function handleUnsetDefault(index: number) {
        const updated = [...value];
        updated[index] = { ...updated[index], isDefault: false };
        onChange(updated);
    }

    // Filter sub docs by searchTerm
    const filteredSubDocs = allSubDocs.filter((s) => {
        const term = searchTerm.toLowerCase();
        return (
            s.name_nl.toLowerCase().includes(term) ||
            (s.internal_name?.toLowerCase().includes(term) ?? false)
        );
    });

    return (
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("dashboard.dragText")}
            </p>

            {/* DnD list */}
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext
                    items={value.map((_, i) => `subRow-${i}`)}
                    strategy={verticalListSortingStrategy}
                >
                    {value.map((item, index) => (
                        <SortableSubproductRow
                            key={`subRow-${index}`}
                            item={item}
                            index={index}
                            allDocs={allSubDocs}
                            onRemove={removeSubproduct}
                            onSetDefault={handleSetDefault}
                            onUnsetDefault={handleUnsetDefault}
                        />
                    ))}
                </SortableContext>
            </DndContext>

            {/* Add button */}
            <div className="mt-4">
                <Button type="button" size="sm" onClick={() => setShowModal(true)}>
                    {t("dashboard.addButtonLabel")}
                </Button>
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                    {error}
                </p>
            )}

            {/* The "Add Subproduct" modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="
              relative z-10 mx-4 max-h-[80vh] w-full max-w-md
              overflow-auto rounded bg-white p-4 shadow-xl
              dark:bg-gray-800 dark:text-white/90
            "
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                {t("dashboard.selectSubproduct")}
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

                        {/* Search */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder={t("dashboard.searchPlaceholder") as string}
                                className="
                  w-full rounded border border-gray-300
                  px-3 py-2 text-sm focus:outline-none focus:ring-1
                  focus:ring-brand-500 dark:border-gray-700
                  dark:bg-gray-900 dark:text-white/90
                "
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") e.preventDefault();
                                }}
                            />
                        </div>

                        <div>
                            {filteredSubDocs.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("dashboard.noSubproductsFound")}
                                </p>
                            ) : (
                                filteredSubDocs.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="
                      mb-2 cursor-pointer rounded border border-transparent
                      px-3 py-2 hover:border-brand-300 hover:bg-gray-100
                      dark:hover:bg-gray-700
                    "
                                        onClick={() => {
                                            addSubproduct(sub.id);
                                            setShowModal(false);
                                        }}
                                    >
                                        <p className="font-medium text-gray-800 dark:text-white/90">
                                            {sub.name_nl}
                                        </p>
                                        {sub.internal_name && (
                                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                                {sub.internal_name}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
