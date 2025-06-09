"use client";

import React from "react";
import LoadingDots from "./components/shared/LoadingDots";
// or wherever you placed the 3-dots loader

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <LoadingDots color="#ED6D38" />
        </div>
    );
}
