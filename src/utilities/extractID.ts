import { Config } from '@/payload-types';
import type { CollectionSlug } from 'payload';

export const extractID = <T extends Config['collections'][CollectionSlug]>(
  objectOrID: T | T['id'] | string | number, // Allow string or number
): T['id'] => {
  if (objectOrID && typeof objectOrID === 'object') {
    return objectOrID.id;
  }

  // Ensure the ID is returned as a string
  return objectOrID?.toString() as T['id'];
};
