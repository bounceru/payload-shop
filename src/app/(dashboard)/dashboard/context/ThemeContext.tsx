// src/app/(dashboard)/dashboard/context/ThemeContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { VenueBranding, Shop } from "@/payload-types";

export type ThemeContextType = {
    branding: VenueBranding | null;
    shop: Shop | null;
    isShop: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
    branding: null,
    shop: null,
    isShop: false,
});

export const ThemeProvider = ({
    children,
    branding,
    shop,
    isShop,
}: {
    children: React.ReactNode;
    branding: VenueBranding | null;
    shop: Shop | null;
    isShop: boolean;
}) => {
    return (
        <ThemeContext.Provider value={{ branding, shop, isShop }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;


};