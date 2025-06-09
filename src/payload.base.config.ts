import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
// Removed duplicate import of 'path'
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import { s3Storage } from '@payloadcms/storage-s3';

// 🎟️ Customers
import { Customers } from './collections/Customers';

// 🏢 Tenancy
import { Tenants } from './collections/Tenants';
import Users from './collections/Users';
import Roles from './collections/Roles';
import { MembershipRoles } from './collections/MembershipRoles';
import { Shops } from './collections/Shops';

// 🎫 Events
import { Events } from './collections/Events';
import { EventTicketTypes } from './collections/EventTicketTypes';
import { SeatMaps } from './collections/SeatMaps';
import { Addons } from './collections/Addons';
import PaymentMethods from './collections/PaymentMethods';

// 🧾 Orders & Tickets
import { Orders } from './collections/Orders';
import { Tickets } from './collections/Tickets';
import { Checkins } from './collections/Checkins';

// 💸 Coupons & Promotions
import { Coupons } from './collections/Coupons';

// 💬 Communication
import { Emails } from './collections/Emails';
import SMTPSettings from './collections/SMTP';
import EmailLogs from './collections/EmailLogs';
import { Newsletters } from './collections/Newsletter';
import EmailTemplates from './collections/EmailTemplates';

// 💡 Support
import { SupportArticles } from './collections/SupportArticles';

// 📊 Analytics & Insights
import { Analytics } from './collections/Analytics';

// 🎨 Branding
import { VenueBranding } from './collections/VenueBranding';

// 🛠️ Assets
import { Media } from './collections/Media';

// 🔒 Hidden System Collections
import { Pages } from './collections/Pages';


import { nl } from '@payloadcms/translations/languages/nl';
import { en } from '@payloadcms/translations/languages/en';
import { de } from '@payloadcms/translations/languages/de';
import { fr } from '@payloadcms/translations/languages/fr';

import cron from 'node-cron';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { EventTicketType } from '@/payload-types';
import path from 'path';

import SeatMapTemplates from './collections/SeatMapTemplates'; // new

// import './cron';


const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

type HideArgs = {
    user?: any;
};

const hideUnlessSuperAdmin = ({ user }: HideArgs) => {
    if (!user?.roles) return true;
    const isSuperAdmin = user.roles.some((roleDoc: any) => roleDoc?.name === 'Super Admin');
    return !isSuperAdmin;
};

export default buildConfig({
    admin: {
        routes: {
            login: '/auth/login',
        },
        components: {
            beforeNavLinks: ['@/components/TenantSelector#TenantSelectorRSC'],
            views: {
                login: {
                    path: '/auth/login',
                    Component: '@/components/Login/CustomLogin.tsx#default',
                },

            },
        },
        theme: 'light',
        user: 'users',
        meta: {
            titleSuffix: 'StagePass',
        },
    },

    i18n: {
        supportedLanguages: { nl, en, de, fr },
        fallbackLanguage: 'nl',
    },
    collections: [
        // 🎟️ Customers
        {
            ...Customers,
            admin: {
                ...Customers.admin,
                group: '🎟️ Customers',
            },
        },

        // 🏢 Tenancy
        {
            ...Tenants,
            admin: {
                ...Tenants.admin,
                group: '🏢 Tenancy',
            },
        },
        {
            ...Users,
            admin: {
                ...Users.admin,
                group: '🏢 Tenancy',
            },
        },
        {
            ...Roles,
            admin: {
                ...Roles.admin,
                group: '🏢 Tenancy',
                hidden: hideUnlessSuperAdmin,
            },
        },
        {
            ...MembershipRoles,
            admin: {
                ...MembershipRoles.admin,
                group: '🏢 Tenancy',
            },
        },
        {
            ...Shops,
            admin: {
                ...Shops.admin,
                group: '🏢 Tenancy',
            },
        },

        // 🎫 Events
        {
            ...Events,
            admin: {
                ...Events.admin,
                group: '🎫 Events',
            },
        },
        {
            ...EventTicketTypes,
            admin: {
                ...EventTicketTypes.admin,
                group: '🎫 Events',
            },
        },
        {
            ...SeatMaps,
            admin: {
                ...SeatMaps.admin,
                group: '🎫 Events',
            },
        },
        {
            ...Addons,
            admin: {
                ...Addons.admin,
                group: '🎫 Events',
            },
        },

        // 🧾 Orders & Tickets
        {
            ...Orders,
            admin: {
                ...Orders.admin,
                group: '🧾 Orders & Tickets',
            },
        },
        {
            ...Tickets,
            admin: {
                ...Tickets.admin,
                group: '🧾 Orders & Tickets',
            },
        },
        {
            ...Checkins,
            admin: {
                ...Checkins.admin,
                group: '🧾 Orders & Tickets',
            },
        },
        {
            ...PaymentMethods,
            admin: {
                ...PaymentMethods.admin,
                group: '💶 Payments',
            },
        },

        // 💸 Coupons & Promotions
        {
            ...Coupons,
            admin: {
                ...Coupons.admin,
                group: '💸 Coupons & Promotions',
            },
        },

        // 💬 Communication
        {
            ...Emails,
            admin: {
                ...Emails.admin,
                group: '💬 Communication',
            },
        },
        {
            ...SMTPSettings,
            admin: {
                ...SMTPSettings.admin,
                group: '💬 Communication',
            },
        },
        {
            ...EmailLogs,
            admin: {
                ...EmailLogs.admin,
                group: '💬 Communication',
            },
        },
        {
            ...Newsletters,
            admin: {
                ...Newsletters.admin,
                group: '💬 Communication',
            },
        },

        // 💡 Support
        {
            ...SupportArticles,
            admin: {
                ...SupportArticles.admin,
                group: '💡 Support',
            },
        },

        // 📊 Analytics & Insights
        {
            ...Analytics,
            admin: {
                ...Analytics.admin,
                group: '📊 Analytics & Insights',
            },
        },

        // 🎨 Branding
        {
            ...VenueBranding,
            admin: {
                ...VenueBranding.admin,
                group: '🎨 Branding',
            },
        },

        // 🛠️ Assets
        {
            ...Media,
            admin: {
                ...Media.admin,
                group: '🛠️ Assets',
            },
        },

        {
            ...SeatMapTemplates,
            admin: {
                ...SeatMapTemplates.admin,
                group: '🛠️ SeatMapTemplates',
            },
        },

        {
            ...EmailTemplates,
            admin: {
                ...EmailTemplates.admin,
                group: '🛠️ EmailTemplates',
            },
        },

        // 🔒 Hidden System Collections
        {
            ...Pages,
            admin: {
                ...Pages.admin,
                hidden: true,
            },
        },
    ],

    localization: {
        locales: ['nl', 'en', 'de', 'fr'],
        defaultLocale: 'nl',
        fallback: true,
    },
    plugins: [
        s3Storage({
            collections: {
                media: true,
            },
            bucket: process.env.DO_BUCKET_NAME || 'default-bucket',
            config: {
                region: process.env.DO_REGION || 'default-region',
                endpoint: process.env.DO_ENDPOINT || 'https://example.com',
                credentials: {
                    accessKeyId: process.env.DO_ACCESS_KEY || '',
                    secretAccessKey: process.env.DO_SECRET_KEY || '',
                },
            },
        }),
    ],
    cors: [
        'http://localhost:3000',
        'http://shop1.localhost:3000',
        'http://shop2.localhost:3000',
        'http://shop3.localhost:3000',
        'http://*.localhost:3000',
        'https://*.ticketingapp.be',
        'https://ticketingapp.be',
        'https://*.stagepass.be',
        'https://stagepass.be',
        'https://shop1.stagepass.be',
        'https://shop2.stagepass.be',
        'https://shop3.stagepass.be',
    ],
    csrf: [
        'http://localhost:3000',
        'http://shop1.localhost:3000',
        'http://shop2.localhost:3000',
        'http://shop3.localhost:3000',
        'https://shop1.stagepass.be',
        'https://shop2.stagepass.be',
        'https://shop3.stagepass.be',
        'http://*.localhost:3000',
        'https://*.ticketingapp.be',
        'https://ticketingapp.be',
        'https://*.stagepass.be',
        'https://stagepass.be',
    ],
    db: mongooseAdapter({
        url: process.env.PAYLOAD_DATABASE_URI || '',
    }),
    editor: lexicalEditor({}),
    email: nodemailerAdapter({
        transportOptions: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        },
        defaultFromName: 'StagePass',
        defaultFromAddress: 'no-reply@stagepass.io',
    }),
    graphQL: {
        schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
    },
    secret: process.env.PAYLOAD_SECRET as string,


    typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
    },

});