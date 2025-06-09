// File: src/collections/Emails/index.ts

import type { CollectionConfig } from 'payload';
import { tenantField } from '@/fields/TenantField';
import { shopsField } from '@/fields/ShopsField';
import { hasPermission, hasFieldPermission } from '@/access/permissionChecker';
import { baseListFilter } from './access/baseListFilter';
import { canMutateEmail } from './access/byTenant';
import { generateEmailHTML } from '@/email/generateEmailHTML';

export const Emails: CollectionConfig = {
    slug: 'emails',

    // -------------------------
    // Access
    // -------------------------
    access: {
        create: canMutateEmail,
        update: canMutateEmail,
        delete: canMutateEmail,
        read: hasPermission('emails', 'read'),
    },

    admin: {
        baseListFilter,
        useAsTitle: 'subject',
        defaultColumns: ['subject', 'allCustomers', 'sentAt', 'createdAt'],
    },

    labels: {
        singular: { en: 'Email' },
        plural: { en: 'Emails' },
    },

    // -------------------------
    // Fields
    // -------------------------
    fields: [
        // 1) Tenant
        {
            ...tenantField,
        },

        // 2) Shops
        {
            ...shopsField,
        },

        // 3) "allCustomers" checkbox
        {
            name: 'allCustomers',
            type: 'checkbox',
            label: 'Send to ALL customers of the selected shop(s)?',
            defaultValue: false,
            admin: {
                description: 'If checked, email goes to every customer from those shop(s).',
            },
        },

        // 4) Recipients (relationship to 'customers')
        {
            name: 'recipients',
            type: 'relationship',
            relationTo: 'customers',
            hasMany: true, // multiple selected
            label: 'Specific Recipients',
            admin: {
                description: 'Choose one or more specific customers to email.',
                components: {
                    Field: '@/fields/CustomersField/components/Field#CustomersFieldComponent',
                },
            },
        },

        {
            name: 'extraRecipients',
            type: 'textarea',
            label: 'Extra Recipients (semicolon-separated)',
            admin: {
                description: 'Add additional email addresses separated by a semicolon (;).'
            }
        },


        // 5) Subject
        {
            name: 'subject',
            type: 'text',
            required: true,
            label: 'Subject',
            access: {
                read: hasFieldPermission('emails', 'subject', 'read'),
                update: hasFieldPermission('emails', 'subject', 'update'),
            },
        },

        // 6) Body
        {
            name: 'body',
            type: 'textarea',
            required: true,
            label: 'Body',
            access: {
                read: hasFieldPermission('emails', 'body', 'read'),
                update: hasFieldPermission('emails', 'body', 'update'),
            },
        },

        // 7) "send" checkbox (user sets to true to trigger sending)
        {
            name: 'send',
            type: 'checkbox',
            label: 'Send Email?',
            defaultValue: false,
            admin: {
                description: 'Check to send this email when you press Save. If left unchecked, it remains a draft.',
            },
            access: {
                read: hasFieldPermission('emails', 'send', 'read'),
                update: hasFieldPermission('emails', 'send', 'update'),
            },
        },

        // 8) sentAt (read-only, set after sending)
        {
            name: 'sentAt',
            type: 'date',
            label: 'Sent At',
            admin: {
                position: 'sidebar',
                readOnly: true,
            },
            access: {
                read: hasFieldPermission('emails', 'sentAt', 'read'),
                update: hasFieldPermission('emails', 'sentAt', 'update'),
            },
        },

        // 9) A single read-only textarea to store all final recipients
        {
            name: 'sentToEmails',
            type: 'textarea',
            label: 'Sent To Emails',
            admin: {
                position: 'sidebar',
                readOnly: true,
            },
            access: {
                read: hasFieldPermission('emails', 'sentToEmails', 'read'),
                update: hasFieldPermission('emails', 'sentToEmails', 'update'),
            },
        },
    ],

    // -------------------------
    // Hooks
    // -------------------------
    hooks: {
        afterChange: [
            async ({ doc, req }) => {
                // 1) If already sent, skip
                if (doc.sentAt) {
                    return;
                }

                // 2) If "send" is NOT checked => remain a draft, skip
                if (!doc.send) {
                    return;
                }

                const { allCustomers, recipients, shops, subject, body, extraRecipients } = doc;
                if (!subject || !body) {
                    console.log('[Emails] Missing subject or body; skipping send.');
                    return;
                }

                // --------------------------
                // Build final recipients
                // --------------------------
                let finalRecipients: string[] = [];

                // (A) All customers from these shops
                if (allCustomers) {
                    // ... your existing shop->customers logic ...
                    let shopIDs: string[] = [];
                    if (Array.isArray(shops)) {
                        shopIDs = shops.map((s: any) => (typeof s === 'string' ? s : s.id));
                    } else if (typeof shops === 'string') {
                        shopIDs = [shops];
                    } else if (typeof shops === 'object') {
                        shopIDs = [shops.id];
                    }

                    if (shopIDs.length > 0) {
                        const found = await req.payload.find({
                            collection: 'customers',
                            where: { shops: { in: shopIDs } },
                            limit: 9999,
                            depth: 0,
                        });
                        finalRecipients = found.docs.map((c: any) => c.email).filter(Boolean);
                    }
                } else {
                    // (B) Specific recipients from relationship field
                    const recArray = Array.isArray(recipients) ? recipients : [];
                    for (const item of recArray) {
                        const customerID = typeof item === 'string' ? item : item?.id;
                        if (!customerID) continue;

                        const cDoc = await req.payload.findByID({
                            collection: 'customers',
                            id: customerID,
                        });
                        if (cDoc?.email) {
                            finalRecipients.push(cDoc.email);
                        }
                    }
                }

                // (C) Additional recipients from the new `extraRecipients` text field
                if (extraRecipients) {
                    // Split on semicolons, trim them, and filter out empty entries
                    interface EmailDocument {
                        allCustomers: boolean;
                        recipients: Array<string | { id: string }>;
                        shops: string | { id: string } | Array<string | { id: string }>;
                        subject: string;
                        body: string;
                        extraRecipients: string;
                        send: boolean;
                        sentAt?: string;
                    }

                    interface RequestPayload {
                        payload: {
                            find: (options: { collection: string; where: any; limit: number; depth?: number }) => Promise<{ docs: any[] }>;
                            findByID: (options: { collection: string; id: string }) => Promise<any>;
                            sendEmail: (options: { to: string; from: string; subject: string; html: string }) => Promise<void>;
                            update: (options: { collection: string; id: string; data: any }) => Promise<void>;
                        };
                    }

                    const parsedExtra: string[] = extraRecipients.split(';')
                        .map((str: string) => str.trim())
                        .filter((str: string) => str.length > 0);

                    finalRecipients.push(...parsedExtra);
                }

                // Make sure we have at least one recipient
                if (finalRecipients.length === 0) {
                    console.log('[Emails] No recipients found; skipping send.');
                    return;
                }

                // --------------------------
                // Fetch Shop + Branding
                // --------------------------
                let brandingTitle = 'MySystem'; // fallback
                let firstShopId: string | null = null;

                if (Array.isArray(shops) && shops.length > 0) {
                    firstShopId = typeof shops[0] === 'string' ? shops[0] : shops[0].id;
                } else if (typeof shops === 'string') {
                    firstShopId = shops;
                } else if (typeof shops === 'object' && shops?.id) {
                    firstShopId = shops.id;
                }

                if (firstShopId) {
                    const shopDoc = await req.payload.findByID({
                        collection: 'shops',
                        id: firstShopId,
                    });

                    if (shopDoc) {
                        const brandingRes = await req.payload.find({
                            collection: 'venue-branding',
                            where: { shops: { in: [shopDoc.id] } },
                            limit: 1,
                        });
                        const brandingDoc = brandingRes.docs[0] as Partial<{ venueTitle?: string }>;
                        if (brandingDoc) {
                            brandingTitle =
                                brandingDoc.venueTitle ||
                                shopDoc.name ||
                                brandingTitle;
                        } else {
                            brandingTitle = shopDoc.name || brandingTitle;
                        }
                    }
                }

                // Final subject line
                const finalSubject = `${brandingTitle} - ${subject}`;

                // --------------------------
                // Generate the HTML
                // --------------------------
                const emailHTML = await generateEmailHTML({
                    skipHeader: true,
                    headline: subject,
                    content: body,
                });

                // --------------------------
                // Send in Batches of 100
                // --------------------------
                const chunkSize = 100;
                for (let i = 0; i < finalRecipients.length; i += chunkSize) {
                    const chunk = finalRecipients.slice(i, i + chunkSize);

                    for (const email of chunk) {
                        await req.payload.sendEmail({
                            to: email,
                            from: `${brandingTitle} <no-reply@orderapp.be>`,
                            subject: finalSubject,
                            html: emailHTML,
                        });
                    }
                }

                // --------------------------
                // Mark as sent & store the final recipients
                // --------------------------
                const joinedRecipients = finalRecipients.join(', ');

                await req.payload.update({
                    collection: 'emails',
                    id: doc.id,
                    data: {
                        sentAt: new Date().toISOString(),
                        send: false, // reset send
                        sentToEmails: joinedRecipients, // store in read-only textarea
                    },
                });

                console.log(`[Emails] Successfully sent. doc.id=${doc.id} recipients=${finalRecipients.length}`);
            },
        ],
    },
};

export default Emails;
