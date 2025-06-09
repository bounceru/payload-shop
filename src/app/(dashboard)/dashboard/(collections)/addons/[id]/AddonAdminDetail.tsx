"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Toaster, toast } from "sonner";

import { DetailShell } from "@/app/(dashboard)/dashboard/components/ui/DetailShell"

// If you have an Addon type:
import type { Addon, Event } from "@/payload-types"

// Minimal type for an event row that we pass from server
interface SimpleEvent {
    id: string
    title: string
}

/** Our local type extending Addon, including `events` as string[] or expanded. */
interface AddonDoc extends Partial<Addon> {
    // Instead of `string | Event[]`, we'll store a string[] of event IDs, or
    // flatten them in mount to keep it consistent
    events?: (string | Event)[]
}

interface AddonAdminDetailProps {
    addon: AddonDoc
    events: SimpleEvent[]         // all tenant events
    isNew?: boolean
}

export default function AddonAdminDetail({
    addon,
    events,
    isNew = false,
}: AddonAdminDetailProps) {
    const router = useRouter()

    // Local state for editing
    const [tempAddon, setTempAddon] = useState<AddonDoc>(() => {
        // If the add-on’s "events" could be strings or expanded objects,
        // we convert them into an array of string IDs:
        const cloned = structuredClone(addon)
        if (Array.isArray(cloned.events)) {
            cloned.events = cloned.events.map((ev) => {
                if (typeof ev === "object" && ev.id) return ev.id
                if (typeof ev === "string") return ev
                return ""
            })
        } else {
            cloned.events = []
        }
        return cloned
    })

    const [isChanged, setIsChanged] = useState(false)

    // Compare original vs current => toggles "Save"
    useEffect(() => {
        const original = JSON.stringify(addon)
        const current = JSON.stringify(tempAddon)
        setIsChanged(original !== current)
    }, [addon, tempAddon])

    // Field updater
    function setFieldValue<T extends keyof AddonDoc>(field: T, value: AddonDoc[T]) {
        setTempAddon((prev) => ({ ...prev, [field]: value }))
    }

    // Helper to toggle an event ID in `tempAddon.events`
    function toggleEventID(eventID: string) {
        if (!Array.isArray(tempAddon.events)) return
        const isSelected = tempAddon.events.includes(eventID)
        let updated = []
        if (isSelected) {
            updated = tempAddon.events.filter((id) => id !== eventID)
        } else {
            updated = [...tempAddon.events, eventID]
        }
        setFieldValue("events", updated)
    }

    // Save => POST or PATCH
    async function handleSave() {
        try {
            const endpoint = "/api/payloadProxy/addons"
            const isCreate = isNew || !tempAddon.id
            const method = isCreate ? "POST" : "PATCH"

            // Flatten relationships if needed
            const body: any = structuredClone(tempAddon)

            // If the add-on has an array of event IDs, we keep that as `body.events`
            // If you want it to remain a relationship (with hasMany true), that’s correct.

            // If "maxQuantity" can be string or number, ensure it’s a number or undefined
            if (typeof body.maxQuantity === "string") {
                if (body.maxQuantity.trim() === "") {
                    delete body.maxQuantity
                } else {
                    body.maxQuantity = parseInt(body.maxQuantity, 10)
                }
            }

            if (!isCreate && body.id === "new") {
                delete body.id
            }

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                throw new Error(`Add-On ${isCreate ? "creation" : "update"} failed.`)
            }
            toast.success("Add-On opgeslagen!")
            setIsChanged(false)

            const result = await res.json()
            if (isCreate) {
                const newID = result?.doc?.id || result.id
                if (newID) {
                    router.push(`/dashboard/addons/${newID}`)
                } else {
                    router.refresh()
                }
            } else {
                router.refresh()
            }
        } catch (err) {
            console.error(err)
            toast.error("Opslaan mislukt.")
        }
    }

    // Delete
    async function handleDelete() {
        if (!tempAddon.id || tempAddon.id === "new") {
            toast.error("Geen ID om te verwijderen.")
            return
        }
        try {
            const delUrl = `/api/payloadProxy/addons?id=${tempAddon.id}`
            const res = await fetch(delUrl, { method: "DELETE" })
            if (!res.ok) {
                throw new Error("Verwijderen mislukt.")
            }
            toast.success("Add-On verwijderd!")
            router.push("/dashboard/addons")
        } catch (err) {
            console.error(err)
            toast.error("Kon Add-On niet verwijderen.")
        }
    }

    return (
        <DetailShell
            title={isNew ? "Nieuwe Add-On" : tempAddon.name || "Add-On"}
            description="Beheer een Add-On"
            onBack={() => router.back()}
            onDelete={!isNew ? handleDelete : undefined}
            onDeleteLabel="Verwijderen"
            onSave={handleSave}
            saveLabel="Opslaan"
            saveDisabled={!isChanged}
        >
            <Toaster position="top-center" />
            {/* Basic fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* name */}
                <div>
                    <label className="block text-sm font-medium mb-1">Naam</label>
                    <input
                        className="border rounded w-full p-2"
                        value={tempAddon.name || ""}
                        onChange={(e) => setFieldValue("name", e.target.value)}
                    />
                </div>

                {/* price */}
                <div>
                    <label className="block text-sm font-medium mb-1">Prijs (€)</label>
                    <input
                        type="number"
                        step="0.01"
                        className="border rounded w-full p-2"
                        value={String(tempAddon.price ?? 0)}
                        onChange={(e) => setFieldValue("price", parseFloat(e.target.value))}
                    />
                </div>
            </div>

            {/* Another row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* available */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={!!tempAddon.available}
                        onChange={(e) => setFieldValue("available", e.target.checked)}
                    />
                    <label className="block text-sm font-medium">Beschikbaar?</label>
                </div>

                {/* isPerTicket */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={!!tempAddon.isPerTicket}
                        onChange={(e) => setFieldValue("isPerTicket", e.target.checked)}
                    />
                    <label className="block text-sm font-medium">Per Ticket?</label>
                </div>
            </div>

            {/* optional fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* maxQuantity */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Max Aantal Per Bestelling
                    </label>
                    <input
                        type="number"
                        min="0"
                        className="border rounded w-full p-2"
                        value={String(tempAddon.maxQuantity ?? "")}
                        onChange={(e) => {
                            const val = e.target.value
                            setFieldValue("maxQuantity", val !== "" ? parseInt(val) : undefined)
                        }}
                    />
                </div>
            </div>

            {/* description */}
            <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Beschrijving</label>
                <textarea
                    className="border rounded w-full p-2"
                    rows={4}
                    value={tempAddon.description || ""}
                    onChange={(e) => setFieldValue("description", e.target.value)}
                />
            </div>

            {/* Multi-select for events */}
            <div className="mt-6">
                <label className="block text-sm font-medium mb-1">
                    Gekoppelde Events
                </label>
                <div className="space-y-1 border p-2 rounded max-h-60 overflow-auto">
                    {events.length === 0 ? (
                        <p className="text-sm text-gray-500">Geen events gevonden.</p>
                    ) : (
                        events.map((ev) => {
                            const isSelected = Array.isArray(tempAddon.events)
                                && tempAddon.events.includes(ev.id)
                            return (
                                <label key={ev.id} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleEventID(ev.id)}
                                    />
                                    <span>{ev.title}</span>
                                </label>
                            )
                        })
                    )}
                </div>
            </div>
        </DetailShell>
    )
}
