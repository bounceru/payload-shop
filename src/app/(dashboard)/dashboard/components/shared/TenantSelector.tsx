// File: /src/components/TenantSelector/index.client.tsx
"use client";

import React, { useEffect, useState } from "react";
import Select from "@/app/(dashboard)/dashboard/components/form/Select";

/** Basic shape returned by /api/me */
type MeResponse = {
    id: string;
    email: string;
    tenants?: {
        tenant?: {
            id: string;
            name?: string;
        } | string;
        roles?: string[];
    }[];
};

/** Minimal shape for each tenant option */
interface TenantOption {
    value: string;
    label: string;
}

function getCookie(name: string): string | undefined {
    const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`));
    return cookie?.split("=")[1];
}

function setCookie(name: string, value: string) {
    const expires = "Fri, 31 Dec 9999 23:59:59 GMT";
    document.cookie = `${name}=${value}; expires=${expires}; path=/; Secure; SameSite=None`;
}

interface TenantSelectorProps {
    initialCookie?: string;
}

export function TenantSelector({ initialCookie }: TenantSelectorProps) {
    const [tenantOptions, setTenantOptions] = useState<TenantOption[]>([]);
    const [selectedValue, setSelectedValue] = useState<string>(initialCookie || "");

    useEffect(() => {
        // Fetch the user info from your /api/me endpoint
        // The user object should contain the tenants array
        async function fetchUser() {
            try {
                const res = await fetch("/api/users/me", {
                    credentials: "include",
                });
                if (!res.ok) {
                    throw new Error(`Failed to fetch /api/me: ${res.status}`);
                }
                const data: MeResponse = await res.json();

                // If user has tenants, map them to { value, label }
                if (data?.tenants && Array.isArray(data.tenants)) {
                    const mapped = data.tenants
                        .filter((t) => t.tenant) // make sure there's a tenant
                        .map((t) => {
                            if (typeof t.tenant === "string") {
                                return {
                                    value: t.tenant,
                                    label: `Tenant ${t.tenant}`, // or fetch name separately
                                };
                            }
                            return {
                                value: t.tenant?.id || "",
                                label: t.tenant?.name || t.tenant?.id || "",
                            };
                        });

                    setTenantOptions(mapped);
                }
            } catch (err) {
                console.error(err);
            }
        }

        void fetchUser();
    }, []);

    function handleTenantChange(newTenantId: string) {
        // Update cookie
        if (newTenantId) {
            setCookie("payload-tenant", newTenantId);
        } else {
            // Or remove cookie if "none" is selected
            setCookie("payload-tenant", "");
        }
        setSelectedValue(newTenantId);

        // Reload page so the new tenant applies
        window.location.reload();
    }

    // If there's only one tenant, or if tenantOptions is empty,
    // you can hide the selector entirely if you like.
    if (tenantOptions.length <= 1) {
        // Optionally auto-set the cookie if there's exactly 1
        return null;
    }

    return (
        <Select
            options={tenantOptions}
            placeholder="Select Tenant"
            onChange={handleTenantChange}
            defaultValue={selectedValue}
        />
    );
}
