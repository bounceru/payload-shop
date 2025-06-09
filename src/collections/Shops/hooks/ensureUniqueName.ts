import { toast } from '@payloadcms/ui';
import type { FieldHook } from 'payload';

export const ensureUniqueName: FieldHook = async ({ data, req, value, originalDoc }) => {
  const tenantID =
    typeof data?.tenant === 'object' ? data.tenant.id : data?.tenant;

  if (!tenantID) {
    console.error('Tenant is undefined');
    throw new Error('Tenant is required for creating a shop');
  }

  const existingShop = await req.payload.find({
    collection: 'shops',
    where: {
      name: {
        equals: value,
      },
      tenant: {
        equals: tenantID,
      },
    },
  });

  // Exclude the current shop being updated
  const isDuplicate = existingShop.docs.some(
    (shop) => shop.id !== originalDoc?.id
  );

  if (isDuplicate) {
    throw new Error(`A shop with the name "${value}" already exists for this tenant.`);
  }

  return value;
};
