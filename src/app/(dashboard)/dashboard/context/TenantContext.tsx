// File: src/context/TenantContext.tsx
"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import * as qs from "qs-esm";
import type { Tenant } from "@/payload-types";

type BasicOption = {
    label: string;
    value: string;
};

type TenantContextValue = {
    user: any;                  // Or a typed user interface
    isSuperAdmin: boolean;
    /** A fully expanded array of permissions like ["categories.update", "categories.fallbackImage.update", ...] */
    roles: string[];
    tenantOptions: BasicOption[];
    selectedTenantId?: string;
    setSelectedTenantId: (tenantId: string) => void;
};

const TenantContext = createContext<TenantContextValue>({
    user: null,
    isSuperAdmin: false,
    roles: [],
    tenantOptions: [],
    selectedTenantId: undefined,
    setSelectedTenantId: () => { },
});

// -- Helper to parse userDoc => an array of permission strings
function buildPermissionsFromUserDoc(userDoc: any): string[] {
    // We'll gather all permission strings in here
    const perms: string[] = [];

    // If user has multiple roles, combine them
    userDoc.roles?.forEach((role: any) => {
        // 1) Collections array => e.g. { collectionName: "categories", read: true, update: true ... }
        role.collections?.forEach((col: any) => {
            const baseName = col.collectionName?.toLowerCase() ?? "";
            if (col.read) perms.push(`${baseName}.read`);
            if (col.create) perms.push(`${baseName}.create`);
            if (col.update) perms.push(`${baseName}.update`);
            if (col.delete) perms.push(`${baseName}.delete`);
        });

        // 2) Fields array => e.g. { collectionName: "categories", fieldName: "fallbackImage", update: false ... }
        role.fields?.forEach((fld: any) => {
            const colName = fld.collectionName?.toLowerCase() ?? "";
            const fieldName = fld.fieldName; // e.g. "fallbackImage"
            if (fld.read) perms.push(`${colName}.${fieldName}.read`);
            if (fld.create) perms.push(`${colName}.${fieldName}.create`);
            if (fld.update) perms.push(`${colName}.${fieldName}.update`);
            if (fld.delete) perms.push(`${colName}.${fieldName}.delete`);
        });
    });

    return perms;
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);

    // We'll store expanded permission strings in `roles`
    const [roles, setRoles] = useState<string[]>([]);
    const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);

    const [tenantOptions, setTenantOptions] = useState<BasicOption[]>([]);
    const [selectedTenantId, setSelectedTenantId] = useState<string>();

    // A) Helper to read a cookie by name
    const getCookieValue = useCallback((name: string): string | undefined => {
        const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
        return match?.[2];
    }, []);

    // B) Helper to set a cookie
    const setCookie = useCallback((name: string, val?: string) => {
        const expires = "Fri, 31 Dec 9999 23:59:59 GMT";
        document.cookie = `${name}=${val ?? ""}; Expires=${expires}; Path=/; SameSite=Lax;`;
    }, []);

    // 1) Fetch /api/users/me => user doc
    useEffect(() => {
        (async () => {
            try {
                const meRes = await fetch("/api/users/me", {
                    credentials: "include",
                });
                if (!meRes.ok) {
                    console.warn("[TenantProvider] /api/users/me not OK:", meRes.status);
                    return;
                }

                const data = await meRes.json();
                const fetchedUser = data.user;
                setUser(fetchedUser);

                // Expand the userDoc's roles + fields into a flat array of strings
                const permissionStrings = buildPermissionsFromUserDoc(fetchedUser);
                setRoles(permissionStrings);

                // If "super admin" is a role name, you can detect it from the userDoc
                // or you might check if they have all permissions
                // For now let's see if any role.name is "super admin"
                const hasSuperAdmin = fetchedUser.roles?.some(
                    (r: any) => r.name?.toLowerCase() === "super admin"
                );
                setIsSuperAdmin(hasSuperAdmin);

                // If there's an existing tenant cookie, store it
                const cookieTenantId = getCookieValue("payload-tenant");
                if (cookieTenantId) {
                    setSelectedTenantId(cookieTenantId);
                }
            } catch (err) {
                console.error("[TenantProvider] Error fetching user:", err);
            }
        })();
    }, [getCookieValue]);

    // 2) Once we have user, fetch the permitted tenants
    useEffect(() => {
        if (!user || !user.tenants) return;

        const adminTenantIDs = user.tenants
            .map((rel: any) => rel.tenant?.id || rel.tenant)
            .filter(Boolean);

        if (adminTenantIDs.length === 0) return;

        const queryString = qs.stringify(
            {
                depth: 0,
                limit: 100,
                sort: "name",
                where: { id: { in: adminTenantIDs } },
            },
            { addQueryPrefix: true }
        );

        (async () => {
            try {
                const res = await fetch(`/api/tenants${queryString}`, {
                    credentials: "include",
                });
                if (!res.ok) {
                    console.warn("[TenantProvider] /api/tenants not OK:", res.status);
                    return;
                }
                const data = await res.json();

                const fetchedOptions: BasicOption[] = (data?.docs || []).map((doc: Tenant) => ({
                    label: doc.name,
                    value: doc.id,
                }));
                setTenantOptions(fetchedOptions);

                // If there's exactly one tenant, auto-select it
                if (fetchedOptions.length === 1) {
                    const singleId = fetchedOptions[0].value;
                    setSelectedTenantId(singleId);
                    setCookie("payload-tenant", singleId);
                } else if (fetchedOptions.length > 1) {
                    // If multiple tenants, see if we already have a cookie
                    const existing = getCookieValue("payload-tenant");
                    if (existing && fetchedOptions.some((opt) => opt.value === existing)) {
                        setSelectedTenantId(existing);
                    }
                }
            } catch (err) {
                console.error("[TenantProvider] Error fetching tenants:", err);
            }
        })();
    }, [user, setCookie, getCookieValue]);

    // 3) Called by <TenantSelector> to switch tenants
    const handleSetTenantId = useCallback(
        (tenantId: string) => {
            setSelectedTenantId(tenantId);
            setCookie("payload-tenant", tenantId);
            window.location.reload();
        },
        [setCookie]
    );

    return (
        <TenantContext.Provider
            value={{
                user,
                isSuperAdmin,
                roles,
                tenantOptions,
                selectedTenantId,
                setSelectedTenantId: handleSetTenantId,
            }}
        >
            {children}
        </TenantContext.Provider>
    );
}

// Optional convenience hook
export function useTenant() {
    return useContext(TenantContext);
}
