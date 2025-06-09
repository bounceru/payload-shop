import { Access, PayloadRequest } from 'payload';
import { FieldAccess } from 'payload'; // specifically for field-level
import { isSuperAdmin } from './isSuperAdmin';

// -----------------------------------------------------
// Common Types
// -----------------------------------------------------
export type PermissionAction = 'read' | 'create' | 'update' | 'delete';

export interface CollectionPermission {
    collectionName: string;
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
}

export interface FieldPermission {
    collectionName: string;
    fieldName: string;
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
}

export interface Role {
    id: string;
    name: string;
    collections: CollectionPermission[];
    fields?: FieldPermission[];
}

// -----------------------------------------------------
// 1) checkPermission (Collection-Level) => boolean
// -----------------------------------------------------
export async function checkPermission(
    collectionName: string,
    action: PermissionAction,
    req: PayloadRequest
): Promise<boolean> {
    // If superadmin => always true
    if (isSuperAdmin({ req })) {
        return true;
    }

    // If the logged-in user is from the "customers" collection (or anything else),
    // they won't have a "roles" array, so return false.
    if (req.user?.collection !== 'users') {
        return false;
    }

    // Now it's safe to assume req.user is a "User" with roles
    const userRoles = req.user.roles as Role[] | undefined;
    if (!userRoles?.length) {
        return false;
    }

    try {
        return userRoles.some((role) => {
            const colPerm = role.collections?.find(
                (perm) => perm.collectionName === collectionName
            );
            return !!colPerm?.[action];
        });
    } catch (error) {
        console.error('Error checking collection perms:', error);
        return false;
    }
}

// -----------------------------------------------------
// 2) hasPermission (Collection-Level) => Access
//    (can return boolean | Where | Promise<...>)
// -----------------------------------------------------
export const hasPermission = (
    collectionName: string,
    action: PermissionAction
): Access => {
    return async ({ req }: { req: PayloadRequest }) => {
        if (!req) return false;
        return await checkPermission(collectionName, action, req);
    };
};

// -----------------------------------------------------
// 3) checkFieldPermission => boolean
// -----------------------------------------------------
export async function checkFieldPermission(
    collectionName: string,
    fieldName: string,
    action: PermissionAction,
    req: PayloadRequest
): Promise<boolean> {
    // If superadmin => always true
    if (isSuperAdmin({ req })) {
        return true;
    }

    // Same logic to ensure we're dealing with a "User"
    if (req.user?.collection !== 'users') {
        return false;
    }

    const userRoles = req.user.roles as Role[] | undefined;
    if (!userRoles?.length) {
        return false;
    }

    try {
        return userRoles.some((role) => {
            const fieldPerm = role.fields?.find(
                (fp) =>
                    fp.collectionName === collectionName &&
                    fp.fieldName === fieldName
            );
            return !!fieldPerm?.[action];
        });
    } catch (error) {
        console.error('Error checking field perms:', error);
        return false;
    }
}

// -----------------------------------------------------
// 4) hasFieldPermission => FieldAccess (strictly boolean)
// -----------------------------------------------------
//
// For field-level Access, we must return boolean | Promise<boolean> only.
// So we define a helper that returns a FieldAccess callback.
export const hasFieldPermission = (
    collectionName: string,
    fieldName: string,
    action: PermissionAction
): FieldAccess => {
    return async ({ req }) => {
        if (!req) return false;
        return await checkFieldPermission(collectionName, fieldName, action, req);
    };
};

// -----------------------------------------------------
// 5) Collection-level convenience
// -----------------------------------------------------
export const canRead = (collectionName: string) =>
    hasPermission(collectionName, 'read');
export const canCreate = (collectionName: string) =>
    hasPermission(collectionName, 'create');
export const canUpdate = (collectionName: string) =>
    hasPermission(collectionName, 'update');
export const canDelete = (collectionName: string) =>
    hasPermission(collectionName, 'delete');

// -----------------------------------------------------
// 6) Field-level convenience (return FieldAccess)
// -----------------------------------------------------
export const canReadField = (collectionName: string, fieldName: string): FieldAccess =>
    hasFieldPermission(collectionName, fieldName, 'read');

export const canCreateField = (collectionName: string, fieldName: string): FieldAccess =>
    hasFieldPermission(collectionName, fieldName, 'create');

export const canUpdateField = (collectionName: string, fieldName: string): FieldAccess =>
    hasFieldPermission(collectionName, fieldName, 'update');

export const canDeleteField = (collectionName: string, fieldName: string): FieldAccess =>
    hasFieldPermission(collectionName, fieldName, 'delete');
