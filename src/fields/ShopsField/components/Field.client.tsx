'use client';

import React, { useState, useEffect } from 'react';
import { useField } from '@payloadcms/ui';

type Props = {
    path: string;
    readOnly: boolean;
};

// Our custom field component for "shops"
export function ShopsFieldComponentClient({ path, readOnly }: Props) {
    // Keep track of the field value from Payload
    // Because hasMany=true, this field is an array of IDs. (e.g. ["shopId1", "shopId2"])
    const { value, setValue } = useField<string[]>({ path });

    // State to hold the array of available shops
    const [shops, setShops] = useState<{ id: string; label: string }[]>([]);

    // State to detect if we are on the "/create" screen
    const [isCreate, setIsCreate] = useState<boolean>(false);

    // 1) Detect if we are on "create" vs. "edit" by URL
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Example: if path ends with "/create"
            setIsCreate(window.location.pathname.endsWith('/create'));
        }
    }, []);

    // 2) Fetch shops for the current tenant
    useEffect(() => {
        const fetchShops = async () => {
            // Grab tenant cookie
            const tenantCookie = document.cookie
                .split('; ')
                .find((row) => row.startsWith('payload-tenant='))
                ?.split('=')[1];

            if (!tenantCookie) {
                console.warn('No tenant cookie found. Could not filter shops by tenant.');
                return;
            }

            const tenantId = decodeURIComponent(tenantCookie);

            // Query your /api/shops?where[tenant][equals]=tenantId
            const response = await fetch(`/api/shops?depth=1&where[tenant][equals]=${tenantId}&limit=1000`);
            const data = await response.json();

            // Create an array for your <select> options
            const fetchedShops = data.docs?.map((shop: { id: string; name: string }) => ({
                id: shop.id,
                label: shop.name,
            })) || [];

            setShops(fetchedShops);
        };

        fetchShops();
    }, []);

    // 3) Auto-select the first shop on CREATE if nothing is selected
    useEffect(() => {
        if (isCreate && shops.length > 0 && (!value || value.length === 0)) {
            // If user hasn't chosen a shop yet, pick the first shop
            setValue([shops[0].id]);
        }
    }, [isCreate, shops, value, setValue]);

    // 4) Render a basic <select> of all shops
    return (
        <div>
            <label>Shops</label>
            <select
                // Because shops is "hasMany:true" but you only want 1 default, we look at [0]
                value={value?.[0] || ''}
                onChange={(e) => {
                    const selectedValue = e.target.value;
                    // Wrap the selected ID in an array, so the field stores ["shopId"]
                    setValue(selectedValue ? [selectedValue] : []);
                }}
                style={{
                    padding: '0.5rem',
                    width: '100%',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                }}
                disabled={readOnly}
            >
                <option value="">Select a Shop</option>
                {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                        {shop.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
