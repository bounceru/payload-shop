// File: src/collections/Media/index.ts

import type { CollectionConfig } from 'payload';
import { tenantField } from '../../fields/TenantField';
import { baseListFilter } from './access/baseListFilter';
import { filterByTenantRead } from './access/byTenant';
import { generateBlurhash } from './hooks/generateBlurhash'; // Updated to reflect no Base64
import { S3 } from '@aws-sdk/client-s3';
import CustomAPIError from '@/errors/CustomAPIError';

import {
  hasPermission,
  hasFieldPermission,
} from '@/access/permissionChecker';

// Helper function to validate filenames
const isFilenameValid = (filename: string): boolean => {
  // Allow only alphanumeric characters, dashes, underscores, and periods
  const regex = /^[a-zA-Z0-9._-]+$/;
  return regex.test(filename);
};

export const Media: CollectionConfig = {
  slug: 'media',

  // Collection-level access
  access: {
    create: hasPermission('media', 'create'),
    delete: hasPermission('media', 'delete'),
    read: hasPermission('media', 'read'),
    update: hasPermission('media', 'update'),
  },

  admin: {
    baseListFilter,
    useAsTitle: 'filename',
    // any defaultColumns if desired:
    // defaultColumns: ['filename', 'blurhash', 'tags'], etc.
  },

  labels: {
    plural: {
      en: 'Media',
      nl: 'Media',
      de: 'Medien',
      fr: 'Médias',
    },
    singular: {
      en: 'Media',
      nl: 'Media',
      de: 'Medium',
      fr: 'Média',
    },
  },

  upload: {
    disableLocalStorage: true, // Use S3 entirely
    imageSizes: [
      { name: 'thumbnail', width: 150, height: 150 },
      { name: 'preview', width: 80, height: 80 },
      { name: 'medium', width: 600, height: 600 },
    ],
    adminThumbnail: 'preview',
  },

  hooks: {
    beforeValidate: [
      async ({ data, operation }) => {
        if ((operation === 'create' || operation === 'update') && data?.filename && !isFilenameValid(data.filename)) {
          throw new CustomAPIError('Invalid filename. Only alphanumeric characters, dashes (-), underscores (_), and periods (.) are allowed.');
        }
        return data;
      },
    ],

    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' && data.filename) {
          data.s3_url = `${process.env.DO_CDN_URL}/${data.filename}`;
        }
        return data;
      },
    ],
    afterChange: [
      async ({ req, operation, doc }) => {
        if (operation === 'create') {
          setTimeout(async () => {
            try {
              const s3 = new S3({
                region: process.env.DO_REGION,
                endpoint: process.env.DO_ENDPOINT,
                credentials: {
                  accessKeyId: process.env.DO_ACCESS_KEY!,
                  secretAccessKey: process.env.DO_SECRET_KEY!,
                },
              });

              // Step 1: Apply public-read ACL
              await s3.putObjectAcl({
                Bucket: process.env.DO_BUCKET_NAME,
                Key: doc.filename,
                ACL: 'public-read',
              });
              console.log(`Applied public-read ACL to ${doc.filename}`);

              // Step 2: Generate Blurhash
              const blurhash = await generateBlurhash({ filename: doc.filename });
              console.log('Generated Blurhash:', blurhash);

              // Step 3: Update the document with the Blurhash
              await req.payload.update({
                collection: 'media',
                id: doc.id,
                data: {
                  blurhash,
                },
              });
              console.log(`Updated document ${doc.id} with Blurhash.`);
            } catch (error) {
              console.error('Error in afterChange hook:', error);
            }
          }, 500);
        }
      },
    ],
  },

  fields: [
    // Tenant in Sidebar (optional)
    {
      ...tenantField,

    },
    // COLLAPSIBLE: Media Info
    {
      type: 'collapsible',
      label: 'Media Info',
      admin: {
        initCollapsed: false, // or true, your choice
      },
      fields: [
        // Tags Array
        {
          name: 'tags',
          type: 'array',
          label: {
            en: 'Tags',
            nl: 'Tags',
            de: 'Tags',
            fr: 'Étiquettes',
          },
          admin: {
            description: {
              en: 'Optional tags to organize media files.',
              nl: 'Optionele tags om mediabestanden te organiseren.',
              de: 'Optionale Tags zur Organisation von Mediendateien.',
              fr: 'Tags optionnels pour organiser les fichiers multimédia.',
            },
          },
          fields: [
            {
              name: 'tag',
              type: 'text',
              label: {
                en: 'Tag',
                nl: 'Tag',
                de: 'Tag',
                fr: 'Étiquette',
              },
              admin: {
                placeholder: {
                  en: 'Enter a tag',
                  nl: 'Voer een tag in',
                  de: 'Geben Sie ein Tag ein',
                  fr: 'Entrez une étiquette',
                },
              },
            },
          ],
          access: {
            read: hasFieldPermission('media', 'tags', 'read'),
            update: hasFieldPermission('media', 'tags', 'update'),
          },
        },

        // Alt Text
        {
          name: 'alt_text',
          type: 'text',
          required: false,
          label: {
            en: 'Alt Text',
            nl: 'Alt Tekst',
            de: 'Alt-Text',
            fr: 'Texte Alt',
          },
          admin: {
            placeholder: {
              en: 'Provide a description for accessibility (optional)',
              nl: 'Geef een beschrijving voor toegankelijkheid (optioneel)',
              de: 'Geben Sie eine Beschreibung für die Barrierefreiheit ein (optional)',
              fr: 'Fournir une description pour l\'accessibilité (optionnel)',
            },
            description: {
              en: 'Alternative text for the media file to improve accessibility.',
              nl: 'Alternatieve tekst voor het mediabestand om de toegankelijkheid te verbeteren.',
              de: 'Alternativtext für die Mediendatei, um die Zugänglichkeit zu verbessern.',
              fr: 'Texte alternatif pour le fichier multimédia pour améliorer l\'accessibilité.',
            },
          },
          access: {
            read: hasFieldPermission('media', 'alt_text', 'read'),
            update: hasFieldPermission('media', 'alt_text', 'update'),
          },
        },
      ],
    },

    // COLLAPSIBLE: File Metadata
    {
      type: 'collapsible',
      label: 'File Metadata',
      admin: {
        initCollapsed: true,
      },
      fields: [
        // Blurhash (read-only)
        {
          name: 'blurhash',
          type: 'text',
          label: {
            en: 'Blurhash',
            nl: 'Blurhash',
            de: 'Blurhash',
            fr: 'Blurhash',
          },
          admin: {
            readOnly: true,
            description: {
              en: 'Blurhash representation of the image for quick previews.',
              nl: 'Blurhash-weergave van de afbeelding voor snelle previews.',
              de: 'Blurhash-Darstellung des Bildes für schnelle Vorschauen.',
              fr: 'Représentation Blurhash de l\'image pour des aperçus rapides.',
            },
          },
          access: {
            read: hasFieldPermission('media', 'blurhash', 'read'),
            update: hasFieldPermission('media', 'blurhash', 'update'),
          },
        },

        // S3 URL (read-only)
        {
          name: 's3_url',
          type: 'text',
          label: {
            en: 'S3 URL',
            nl: 'S3 URL',
            de: 'S3 URL',
            fr: 'URL S3',
          },
          admin: {
            readOnly: true,
            description: {
              en: 'URL of the original image in S3.',
              nl: 'URL van de originele afbeelding in S3.',
              de: 'URL des Originalbildes in S3.',
              fr: 'URL de l\'image originale dans S3.',
            },
          },
          access: {
            read: hasFieldPermission('media', 's3_url', 'read'),
            update: hasFieldPermission('media', 's3_url', 'update'),
          },
        },
      ],
    },

  ],
};

export default Media;
