"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Menu, X, Search, MapPin } from "lucide-react"

type NavBarProps = {
    isShop?: boolean
    logoUrl: string
    shopName?: string
    ctaColor?: string // e.g. '#2563eb'
}

export default function NavBar({ isShop = false, logoUrl, shopName, ctaColor = "#2563eb" }: NavBarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [location, setLocation] = useState("")

    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    useEffect(() => {
        setSearchTerm(searchParams.get("search") || "")
        setLocation(searchParams.get("location") || "")
    }, [searchParams])

    const navLinks = isShop
        ? [
            { href: "/", label: "Evenement zoeken" },
            { href: "/support", label: "Helpdesk" },
        ]
        : [
            { href: "/", label: "Evenement zoeken" },
            { href: "/evenementen", label: "Evenement maken" },
            { href: "/support", label: "Helpdesk" },
        ]

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        const params = new URLSearchParams(searchParams.toString())
        if (searchTerm) params.set("search", searchTerm)
        else params.delete("search")
        if (location) params.set("location", location)
        else params.delete("location")
        router.push(`${pathname}?${params.toString()}`)
        setIsMobileMenuOpen(false)
    }

    return (
        <header className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Left: Logo + Shop Name */}
                    <Link
                        href="/"
                        className="flex items-center gap-3 group transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg"
                    >
                        <div className="relative">
                            <img
                                src={logoUrl || "/placeholder.svg"}
                                alt="Logo"
                                className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg shadow-sm ring-1 ring-gray-200 group-hover:shadow-md transition-shadow"
                            />
                        </div>
                        {isShop && shopName && (
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900 truncate max-w-[140px] sm:max-w-[180px]">
                                    {shopName}
                                </span>
                                <span className="text-xs text-gray-500">Shop</span>
                            </div>
                        )}
                        {!isShop && (
                            <div className="flex flex-col">
                                <span className="text-lg sm:text-xl font-bold text-[#ED6D38] tracking-tight">Stagepass</span>
                                <span className="text-xs text-gray-500 -mt-1">Event Platform</span>
                            </div>
                        )}
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <form onSubmit={handleSearch} className="flex items-center border rounded-lg overflow-hidden mr-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Zoek evenementen"
                                    className="pl-9 pr-3 py-2 text-sm focus:outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="relative border-l">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Locatie"
                                    className="pl-9 pr-3 py-2 text-sm focus:outline-none"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="px-3 text-gray-600 hover:text-gray-900">
                                <Search className="h-4 w-4" />
                            </button>
                        </form>
                        <nav className="flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="relative px-4 py-2 text-sm font-medium text-gray-700 rounded-lg transition-all duration-200 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 group"
                                >
                                    {link.label}
                                    <span className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </nav>

                        <Link
                            href="/login"
                            className="relative inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:translate-y-0"
                            style={{
                                backgroundColor: ctaColor,
                                boxShadow: `0 4px 14px 0 ${ctaColor}25`,
                            }}
                        >
                            <span>Login</span>
                            <div
                                className="absolute inset-0 rounded-lg opacity-0 hover:opacity-20 transition-opacity"
                                style={{
                                    background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
                                }}
                            />
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                        aria-expanded={isMobileMenuOpen}
                        aria-label="Toggle navigation menu"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-100 bg-white">
                        <div className="px-4 pt-4 pb-3 space-y-1">
                            <form onSubmit={handleSearch} className="mb-3">
                                <div className="flex flex-col gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Zoek evenementen"
                                            className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Locatie"
                                            className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        />
                                    </div>
                                    <button type="submit" className="w-full flex justify-center items-center gap-2 py-2 bg-gray-100 rounded-md text-gray-700 mt-1">
                                        <Search className="h-4 w-4" />
                                        <span>Zoeken</span>
                                    </button>
                                </div>
                            </form>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-2">
                                <Link
                                    href="/login"
                                    className="block w-full text-center px-4 py-3 text-base font-semibold text-white rounded-lg shadow-sm transition-all duration-200"
                                    style={{ backgroundColor: ctaColor }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
