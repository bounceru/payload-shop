import type { FieldHook } from 'payload';
import { ValidationError } from 'payload';
import { getTenantAccessIDs } from '../../../utilities/getTenantAccessIDs';

export const ensureUniqueUsername: FieldHook = async ({ data, originalDoc, req, value }) => {
  // 1) If username is unchanged, skip validation
  if (originalDoc.username === value) {
    return value;
  }

  // 2) Determine which tenant ID to use
  const incomingTenantID = typeof data?.tenant === 'object' ? data.tenant.id : data?.tenant;
  const currentTenantID =
    typeof originalDoc?.tenant === 'object' ? originalDoc.tenant.id : originalDoc?.tenant;
  const tenantIDToMatch = incomingTenantID || currentTenantID;

  // 3) Check for an existing user with same username under same tenant
  const findDuplicateUsers = await req.payload.find({
    collection: 'users',
    where: {
      and: [
        { 'tenants.tenant': { equals: tenantIDToMatch } },
        { username: { equals: value } },
      ],
    },
  });

  // 4) If duplicate found and we have a logged-in user
  if (findDuplicateUsers.docs.length > 0 && req.user) {
    // Narrow to 'User' if collection='users'
    const userDoc = req.user.collection === 'users' ? req.user : null;

    // Only get tenant IDs if userDoc is truly a user
    const tenantIDs = userDoc ? getTenantAccessIDs(userDoc) : [];

    // Check if userDoc has 'super-admin' role OR has more than 1 tenant
    if (
      (userDoc?.roles?.includes('super-admin')) ||
      tenantIDs.length > 1
    ) {
      const attemptedTenantChange = await req.payload.findByID({
        collection: 'tenants',
        id: tenantIDToMatch,
      });

      throw new ValidationError({
        errors: [
          {
            message: `The "${attemptedTenantChange.name}" tenant already has a user with the username "${value}". Usernames must be unique per tenant.`,
            path: 'username',
          },
        ],
      });
    }

    // Otherwise show a generic error
    throw new ValidationError({
      errors: [
        {
          message: `A user with the username "${value}" already exists. Usernames must be unique per tenant.`,
          path: 'username',
        },
      ],
    });
  }

  return value;
};
