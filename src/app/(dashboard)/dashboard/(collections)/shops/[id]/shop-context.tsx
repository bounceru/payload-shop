"use client";

import React, { createContext, useContext } from "react";
import type { Shop } from "@/payload-types";

// 1) Create the context
const ShopContext = createContext<Shop | null>(null);

// 2) ShopProvider component - wraps children and provides the shop doc
export function ShopProvider({
    value,
    children,
}: {
    value: Shop;
    children: React.ReactNode;
}) {
    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

// 3) Hook for child components to consume the shop doc
export function useShop(): Shop {
    const shop = useContext(ShopContext);
    if (!shop) {
        throw new Error("useShop() must be used inside <ShopProvider>!");
    }
    return shop;
}
