import type { FieldHook } from 'payload';
import { ValidationError } from 'payload';
import { getTenantAccessIDs } from '../../../utilities/getTenantAccessIDs';

export const ensureUniqueSlug: FieldHook = async ({ data, originalDoc, req, value }) => {
  // 1) If slug unchanged, skip
  if (originalDoc.slug === value) return value;

  // 2) Determine tenant ID
  const incomingTenantID =
    typeof data?.tenant === 'object' ? data.tenant.id : data?.tenant;
  const currentTenantID =
    typeof originalDoc?.tenant === 'object' ? originalDoc.tenant.id : originalDoc?.tenant;
  const tenantIDToMatch = incomingTenantID || currentTenantID;

  // 3) Check if there's a duplicate slug on that tenant
  const findDuplicatePages = await req.payload.find({
    collection: 'pages',
    where: {
      and: [
        {
          tenant: {
            equals: tenantIDToMatch,
          },
        },
        {
          slug: {
            equals: value,
          },
        },
      ],
    },
  });

  if (findDuplicatePages.docs.length > 0 && req.user) {
    // --- Narrow the user to "User" if collection===users ---
    const userDoc = req.user.collection === 'users' ? req.user : null;

    // If it's a user, run getTenantAccessIDs(userDoc). Otherwise, empty array
    const tenantIDs = userDoc ? getTenantAccessIDs(userDoc) : [];

    // Check if userDoc is super-admin, otherwise it's false
    const isSuperAdmin = userDoc?.roles?.includes('super-admin') || false;

    // If user is super-admin or has >1 tenant, show detailed error
    if (isSuperAdmin || tenantIDs.length > 1) {
      const attemptedTenantChange = await req.payload.findByID({
        collection: 'tenants',
        id: tenantIDToMatch,
      });

      throw new ValidationError({
        errors: [
          {
            message: `The "${attemptedTenantChange.name}" tenant already has a page with the slug "${value}". Slugs must be unique per tenant.`,
            path: 'slug',
          },
        ],
      });
    }

    // Otherwise, show simpler error
    throw new ValidationError({
      errors: [
        {
          message: `A page with the slug "${value}" already exists. Slug must be unique per tenant.`,
          path: 'slug',
        },
      ],
    });
  }

  return value;
};
