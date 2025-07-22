// File: src/collections/Users/index.ts

import type { CollectionConfig } from 'payload'
import { externalUsersLogin } from './endpoints/externalUsersLogin'
import { setCookieBasedOnDomain } from './hooks/setCookieBasedOnDomain'
import { hasPermission, hasFieldPermission } from '@/access/permissionChecker'
import { baseListFilter } from './access/baseListFilter'
import { meEndpoint } from './endpoints/me'

const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 24 * 365, //(controls session expiration)
    cookies: {
      secure: true, // Must be true for "None" to work
      sameSite: 'None', // Allows cookies to work across domains and subdomains
    },
  },
  // ---------------------------
  // Collection-level access
  // ---------------------------
  access: {
    create: () => true,
    delete: hasPermission('users', 'delete'),
    read: hasPermission('users', 'read'),
    update: hasPermission('users', 'update'),
  },

  admin: {
    useAsTitle: 'email',
    baseListFilter,
  },

  labels: {
    plural: {
      en: 'Users',
      nl: 'Gebruikers',
      de: 'Benutzer',
      fr: 'Utilisateurs',
    },
    singular: {
      en: 'User',
      nl: 'Gebruiker',
      de: 'Benutzer',
      fr: 'Utilisateur',
    },
  },

  hooks: {
    afterLogin: [setCookieBasedOnDomain],
  },

  endpoints: [externalUsersLogin, meEndpoint],

  fields: [
    {
      // 1) Roles relationship field
      name: 'roles',
      type: 'relationship',
      relationTo: 'roles',
      label: {
        en: 'Roles',
        nl: 'Rollen',
        de: 'Rollen',
        fr: 'Rôles',
      },
      hasMany: true,
      admin: {
        description: {
          en: 'Assign roles to the user.',
          nl: 'Wijs rollen toe aan de gebruiker.',
          de: 'Weisen Sie dem Benutzer Rollen zu.',
          fr: 'Attribuez des rôles à l\'utilisateur.',
        },
      },
      // Field-level access
      access: {
        read: hasFieldPermission('users', 'roles', 'read'),
        update: hasFieldPermission('users', 'roles', 'update'),
      },
    },
    {
      // 2) Tenants array
      name: 'tenants',
      type: 'array',
      access: {
        read: hasFieldPermission('users', 'tenants', 'read'),
        update: hasFieldPermission('users', 'tenants', 'update'),
      },
      fields: [
        {
          name: 'tenant',
          type: 'relationship',
          label: {
            en: 'Tenants',
            nl: 'Eigenaars',
            de: 'Eigentümer',
            fr: 'Propriétaires',
          },
          admin: {
            description: {
              en: 'Assign tenants to the user.',
              nl: 'Wijs eigenaars toe aan de gebruiker.',
              de: 'Weisen Sie dem Benutzer Eigentümer zu.',
              fr: 'Attribuez des propriétaires à l\'utilisateur.',
            },
          },
          relationTo: 'tenants',
          required: true,
          saveToJWT: true,
        },
        {
          name: 'roles',
          type: 'select',
          label: {
            en: 'Tenant Roles',
            nl: 'Eigenaar Rollen',
            de: 'Eigentümerrollen',
            fr: 'Rôles du Propriétaire',
          },
          defaultValue: ['tenant-viewer'],
          hasMany: true,
          admin: {
            description: {
              en: 'Assign roles specific to the tenant.',
              nl: 'Wijs rollen toe die specifiek zijn voor de eigenaar.',
              de: 'Weisen Sie rollen zu, die speziell für den Eigentümer sind.',
              fr: 'Attribuez des rôles spécifiques au propriétaire.',
            },
          },
          options: [
            {
              label: {
                en: 'Tenant Admin',
                nl: 'Eigenaar Beheerder',
                de: 'Eigentümeradministrator',
                fr: 'Administrateur du Propriétaire',
              },
              value: 'tenant-admin',
            },
            {
              label: {
                en: 'Tenant Viewer',
                nl: 'Eigenaar Kijker',
                de: 'Eigentümerbetrachter',
                fr: 'Visualiseur du Propriétaire',
              },
              value: 'tenant-viewer',
            },
          ],
          required: true,
        },
      ],
      saveToJWT: true,
    },

    {
      // 4) Username text
      name: 'stripeCustomerId',
      type: 'text',
      label: {
        en: 'stripeCustomerId',
        nl: 'stripeCustomerId',
        de: 'stripeCustomerId',
        fr: 'stripeCustomerId',
      },
    },
    {
      name: 'fullName',
      type: 'text',
      required: false,
      label: {
        en: 'Full Name',
        nl: 'Volledige naam',
        de: 'Vollständiger Name',
        fr: 'Nom complet',
      },
      admin: {
        description: {
          en: 'Full name of the user (used in staff display, confirmation mails, etc.)',
          nl: 'Volledige naam van de gebruiker (gebruikt in bevestigingsmails of personeelspagina’s).',
          de: 'Vollständiger Name des Benutzers (z.B. für Bestätigungs-Mails oder Personalübersicht).',
          fr: 'Nom complet de l’utilisateur (affiché dans les e-mails et dans les interfaces internes).',
        },
      },
      access: {
        read: hasFieldPermission('users', 'fullName', 'read'),
        update: hasFieldPermission('users', 'fullName', 'update'),
      },
    },

    {
      name: 'phoneNumber',
      type: 'text',
      label: {
        en: 'Phone Number',
        nl: 'Telefoonnummer',
        de: 'Telefonnummer',
        fr: 'Numéro de téléphone',
      },
      admin: {
        description: {
          en: 'Optional phone number for SMS login or contact.',
          nl: 'Optioneel telefoonnummer voor SMS-login of contact.',
          de: 'Optionale Telefonnummer für SMS-Login oder Kontakt.',
          fr: 'Numéro optionnel pour le login par SMS ou contact.',
        },
      },
      access: {
        read: hasFieldPermission('users', 'phoneNumber', 'read'),
        update: hasFieldPermission('users', 'phoneNumber', 'update'),
      },
    },
  ],
}

export default Users
