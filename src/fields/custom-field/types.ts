export type PermissionAction = 'read' | 'create' | 'update' | 'delete';

export interface CollectionPermission {
    collectionName: string;
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
}

/**
 * For field-level permissions: each item corresponds to
 * a specific field in a specific collection.
 */
export interface FieldsPermission {
    collectionName: string;
    fieldName: string;
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
}

/**
 * The shape of data we send to our "saveRole" or "updateRole" endpoints.
 * Now includes `fields` for field-level permissions.
 */
export interface RoleFormData {
    name: string;
    collections?: CollectionPermission[];
    fields?: FieldsPermission[]; // optional if not always present
}

/**
 * The shape of the doc we receive when editing a Role
 * in our custom UI components. 
 */
export interface RoleDoc {
    id?: string;
    name?: string;
    collections?: CollectionPermission[];
    fields?: FieldsPermission[];
}

/**
 * Props for your CollectionsTable (collection-level perms).
 * doc is our RoleDoc to be edited, collectionNames is the array of collection slugs.
 */
export interface CollectionsTableProps {
    collectionNames: string[];
    doc?: RoleDoc;
}

/**
 * Similarly, props for your FieldsTable (field-level perms),
 * if you want a separate table to manage field-based permissions.
 */
export interface FieldsTableProps {
    doc?: RoleDoc;
}

/**
 * Checkbox props for your permission checkboxes
 * (both collection-level and field-level).
 */
export interface PermissionCheckboxProps {
    checked: boolean;
    action: PermissionAction;
    onChange: (action: PermissionAction, event: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
}
