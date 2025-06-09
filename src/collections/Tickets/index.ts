// ───────────────────────────────────────────────────────────
// File: src/collections/Tickets/index.ts
// ───────────────────────────────────────────────────────────
import type { CollectionConfig } from 'payload';

import { tenantField } from '@/fields/TenantField';
import { hasPermission } from '@/access/permissionChecker';
import { baseListFilter } from './access/baseListFilter';
import crypto from 'crypto';

const genBarcode = () =>
    crypto.randomBytes(6).toString('hex').toUpperCase();

/* ----- helper interface for ticket‐type snapshot ----- */
interface EventTicketType {
    id: string;
    name: string;
    event: string | { id: string };
    price: number;
    vatRate?: number;
    maxAmount?: number;
}

export const Tickets: CollectionConfig = {
    slug: 'tickets',

    access: {
        create: hasPermission('tickets', 'create'),
        delete: hasPermission('tickets', 'delete'),
        read: hasPermission('tickets', 'read'),
        update: hasPermission('tickets', 'update'),
    },

    admin: {
        useAsTitle: 'barcode',
        group: '🎫 Ticketing',
        baseListFilter,
        defaultColumns: [
            'barcode',
            'event',
            'ticketType',
            'customer',
            'status',
        ],
    },

    hooks: {
        beforeChange: [
            async ({ data, req, operation }) => {
                if (operation !== 'create') return;

                /* tenant guard ---------------------------------------------------- */
                const tenantId =
                    typeof data.tenant === 'object' ? data.tenant.id : data.tenant;
                if (!tenantId) throw new Error('Tenant is required');

                /* barcode ---------------------------------------------------------- */
                if (!data.barcode) data.barcode = genBarcode();

                let ttId =
                    typeof data.ticketType === "object"
                        ? data.ticketType.id
                        : data.ticketType;
                if (!ttId) throw new Error("ticketType is required");

                let tt: Partial<EventTicketType> | null = null;
                let ttDoc: Partial<EventTicketType> | null = null;

                if (typeof data.ticketType === "object") {
                    tt = data.ticketType as unknown as EventTicketType;
                }

                const isObjectId = typeof ttId === "string" && /^[0-9a-fA-F]{24}$/.test(ttId);

                if (isObjectId) {
                    try {
                        const raw = await req.payload.findByID({
                            collection: "event-ticket-types",
                            id: ttId,
                        });
                        ttDoc = raw as unknown as EventTicketType;
                        tt = ttDoc;
                    } catch {
                        /* ignore */
                    }
                }

                if (!ttDoc) {
                    const eventId =
                        typeof data.event === "object" ? data.event?.id : data.event;
                    if (!tt && eventId) {
                        try {
                            const ev = await req.payload.findByID({
                                collection: "events",
                                id: eventId,
                            });
                            tt = ((ev.ticketTypes || []).find((t: any) => t.id === ttId) as Partial<EventTicketType> | undefined) ?? null;
                        } catch {
                            /* ignore */
                        }
                    }

                    if (!tt) throw new Error(`TicketType ${ttId} not found`);

                    // create persistent ticket type so we can reference it
                    const created = await req.payload.create({
                        collection: "event-ticket-types",
                        data: {
                            tenant: tenantId,
                            event: eventId,
                            name: tt.name ?? String(ttId),
                            price: tt.price ?? 0,
                            vatRate: tt.vatRate ?? 21,
                            maxAmount: tt.maxAmount ?? 0,
                            color: (tt as any).color ?? undefined,
                        },
                    });
                    ttDoc = created as unknown as EventTicketType;
                    tt = ttDoc;
                    ttId = ttDoc.id;
                }

                data.ticketType = ttId;
                /* same-event guard ------------------------------------------------- */
                if (!tt) {
                    throw new Error(`TicketType ${ttId} not found or invalid`);
                }
                const ttEventId = typeof tt.event === 'object' ? tt.event.id : tt.event;
                const ticketEvent = typeof data.event === 'object' ? data.event?.id : data.event;

                if (!ticketEvent) {
                    // If no event is specified yet, default to the ticket type's event
                    data.event = ttEventId;
                }

                /* snapshot price + VAT -------------------------------------------- */
                // Check if the price is already set in the data (e.g., from the frontend)
                if (!data.price) {
                    data.price = tt.price; // Only set the price from ticket type if it's not already set
                }
                if (!data.vatRate) {
                    data.vatRate = tt.vatRate ?? 0; // Set vatRate if not already present
                }

                /* enforce max amount ---------------------------------------------- */
                if (typeof tt.maxAmount === "number" && tt.maxAmount > 0) {
                    const sold = await req.payload.count({
                        collection: 'tickets',
                        where: {
                            event: { equals: ttEventId },
                            ticketType: { equals: ttId },
                            status: { not_equals: 'cancelled' },
                        },
                    });

                    if (sold.totalDocs >= tt.maxAmount) {
                        throw new Error(
                            `Cap of ${tt.maxAmount} tickets for type “${tt.name}” reached.`,
                        );
                    }
                }
            },
        ],
    },

    /* ----------------------------- fields ----------------------------- */
    fields: [
        tenantField,

        // Identification
        {
            name: 'barcode',
            type: 'text',
            unique: true,
            required: true,
            admin: {
                readOnly: true,
                description: 'Auto-generated if left empty',
            },
        },

        // Foreign keys
        {
            name: 'event',
            type: 'relationship',
            relationTo: 'events',
            required: true,
            label: { en: 'Event' },
        },
        {
            name: 'ticketType',
            type: 'relationship',
            relationTo: 'event-ticket-types',
            required: true,
            label: { en: 'Ticket Type' },
        },
        {
            name: 'order',
            type: 'relationship',
            relationTo: 'orders',
            required: true,
            label: { en: 'Order' },
        },
        {
            name: 'customer',
            type: 'relationship',
            relationTo: 'customers',
            label: { en: 'Customer' },
        },

        // Optional seat
        {
            name: 'seatRow',
            type: 'text',
            label: { en: 'Seat Row' },
            admin: { condition: (data) => !!data?.seatRow },
        },
        {
            name: 'seatNumber',
            type: 'text',
            label: { en: 'Seat Number' },
            admin: { condition: (data) => !!data?.seatNumber },
        },

        // Financial snapshot
        {
            name: 'price',
            type: 'number',
            required: true,
            admin: {
                readOnly: true,
                description: 'Copied from ticket type at checkout',
            },
        },
        {
            name: 'vatRate',
            type: 'number',
            required: true,
            admin: {
                readOnly: true,
                description: 'Copied from ticket type at checkout',
            },
        },

        // Lifecycle
        {
            name: 'status',
            type: 'select',
            required: true,
            defaultValue: 'valid',
            options: [
                { label: 'Valid', value: 'valid' },
                { label: 'Scanned', value: 'scanned' },
                { label: 'Cancelled', value: 'cancelled' },
                { label: 'Refunded', value: 'refunded' },
            ],
        },
        {
            name: 'issuedAt',
            type: 'date',
            required: true,
            defaultValue: () => new Date().toISOString(),
            admin: { readOnly: true },
        },
        {
            name: 'scannedAt',
            type: 'date',
            admin: {
                readOnly: true,
                description: 'Set automatically on first successful scan',
            },
        },
    ],
};

export default Tickets;
