import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Outfit } from "next/font/google";
import { fetchShopContext } from "@/lib/fetchShopContext";

import Providers from "./Providers";
import AppHeader from "./layout/AppHeader";
import AppSidebar from "./layout/AppSidebar";
import Backdrop from "./layout/Backdrop";

import "../../../app/(app)/globals.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";

import { ThemeProvider } from "./context/ThemeContext";

const outfit = Outfit({ subsets: ["latin"] });

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // ─── Server-side auth guard using /api/access ──────────────
    const cookieHeader = cookies().toString();
    const nextHeaders = await headers();
    const nextUrl = nextHeaders.get("next-url") ?? "/dashboard";

    // console.log("Fetching access data...");
    const accessRes = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/access`, {
        headers: {
            Cookie: cookieHeader,
        },
        cache: "no-store",
    });
    // console.log("Access response status:", accessRes.status);
    const access = await accessRes.json();
    // console.log("Access response data:", access);


    // 👇 Adjust this based on your real collection
    const hasAccess = access?.canAccessAdmin === true

    if (!hasAccess) {
        redirect(`/signin?next=${encodeURIComponent(nextUrl)}`);
    }

    // ─── Fetch shop/branding info ─────────────────────
    const { branding, shop, isShop } = await fetchShopContext({});

    return (
        <html lang="en">
            <body className={outfit.className} style={{ backgroundColor: "#f3f3f3" }}>
                <ThemeProvider branding={branding} shop={shop} isShop={isShop}>
                    <Providers>
                        <AppHeader />
                        <AppSidebar />
                        <Backdrop />
                        <main className="lg:ml-[290px] mt-[72px] p-4 min-h-[calc(100vh-72px)] py-4 px-4 md:py-6 md:px-16">
                            {children}</main>
                    </Providers>
                </ThemeProvider>
            </body>
        </html>
    );
}
