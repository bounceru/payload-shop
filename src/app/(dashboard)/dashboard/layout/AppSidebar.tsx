"use client"

import type React from "react"
import { useRef, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "../context/SidebarContext"
import {
  Home,
  Calendar,
  Ticket,
  Building2,
  Users,
  ShoppingBag,
  Gift,
  Tag,
  Settings,
  Map,
  FileText,
  Mail,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Crown,
  Star,
  TrendingUp,
  Activity,
} from "lucide-react"

import SidebarWidget from "../layout/SidebarWidget"
import { useTranslation } from "@/context/TranslationsContext"
import { useTenant } from "../context/TenantContext"
import LockedPerm from "../components/ui/LockedPerm"
import { useTheme } from "../context/ThemeContext"

type SubItem = {
  name: string
  path: string
  locked?: boolean
  badge?: string
  icon?: React.ReactNode
}

type NavItem = {
  name: string
  icon?: React.ReactNode
  path?: string
  subItems?: SubItem[]
  badge?: string
  premium?: boolean
}

export default function AppSidebar() {
  const { isSuperAdmin, roles, user } = useTenant()
  const { branding } = useTheme()
  const { t } = useTranslation()

  const permsReady = roles.length > 0 || isSuperAdmin

  const pathname = usePathname()
  const isActive = useCallback(
    (path: string) => {
      if (path === "/dashboard") {
        return pathname === "/dashboard" // strict match
      }
      return pathname.startsWith(path) // loose match for subpages
    },
    [pathname],
  )

  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar()

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: string
    index: number
  } | null>(null)

  const [subMenuHeights, setSubMenuHeights] = useState<Record<string, number>>({})
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (user) {
      console.log("[Sidebar] Logged-in user:", user)
    }
  }, [user])

  const ctaColor = branding?.primaryColorCTA || "#ED6D38"

  const navItems: NavItem[] = [
    {
      icon: <Home className="h-5 w-5" />,
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      name: "Evenementen",
      path: "/dashboard/events",

    },
    {
      icon: <Building2 className="h-5 w-5" />,
      name: "Locaties",
      path: "/dashboard/shops",
    },
    {
      icon: <Ticket className="h-5 w-5" />,
      name: "Tickets",
      path: "/dashboard/tickets",
    },
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      name: "Bestellingen",
      path: "/dashboard/orders",
    },
    {
      icon: <Users className="h-5 w-5" />,
      name: "Klanten",
      path: "/dashboard/customers",
    },
    {
      icon: <Tag className="h-5 w-5" />,
      name: "Kortingscodes",
      path: "/dashboard/coupons",

    },
    {
      icon: <Gift className="h-5 w-5" />,
      name: "Addons",
      path: "/dashboard/addons",
    },
    {
      icon: <Map className="h-5 w-5" />,
      name: "Stoelplattegronden",
      path: "/dashboard/seat-map",

    },
    {
      icon: <Mail className="h-5 w-5" />,
      name: "Emails",
      path: "/dashboard/emails",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      name: "Supportartikelen",
      path: "/dashboard/support-article",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      name: "Tenants",
      path: "/dashboard/tenant",
    },
  ]

  function handleToggle(type: string, index: number) {
    setOpenSubmenu((prev) => (prev && prev.type === type && prev.index === index ? null : { type, index }))
  }

  function handleLinkClick() {
    if (isMobileOpen) toggleMobileSidebar()
  }

  const isCollapsed = !isExpanded && !isHovered && !isMobileOpen

  function renderMenuItems(items: NavItem[], type: string) {
    return (
      <ul className="flex flex-col gap-1">
        {items.map((nav, index) => {
          const isOpen = openSubmenu?.type === type && openSubmenu.index === index
          const hasSubItems = !!nav.subItems?.length
          const isCurrentActive = nav.path ? isActive(nav.path) : false

          return (
            <li key={`${type}-${index}-${nav.name}`}>
              {hasSubItems ? (
                <>
                  <button
                    onClick={() => handleToggle(type, index)}
                    className={`group relative flex items-center justify-between w-full px-3 py-3 rounded-xl transition-all duration-200 hover:bg-gray-50 hover:shadow-sm ${isOpen ? "bg-gray-50 shadow-sm" : ""
                      }`}
                  >
                    <span className="flex items-center gap-3 font-medium text-sm text-gray-700 group-hover:text-gray-900">
                      <div className="relative">
                        {nav.icon}
                        {nav.premium && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />
                        )}
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="truncate">{nav.name}</span>
                          {nav.badge && (
                            <span
                              className="px-2 py-0.5 text-xs font-semibold text-white rounded-full"
                              style={{ backgroundColor: ctaColor }}
                            >
                              {nav.badge}
                            </span>
                          )}
                        </>
                      )}
                    </span>
                    {!isCollapsed && (
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                          }`}
                      />
                    )}
                  </button>

                  {!isCollapsed && (
                    <div
                      ref={(el) => {
                        subMenuRefs.current[`${type}-${index}`] = el
                      }}
                      className="overflow-hidden transition-all duration-300"
                      style={{
                        height: isOpen ? `${subMenuHeights[`${type}-${index}`] || 0}px` : "0px",
                      }}
                    >
                      <ul className="ml-8 mt-2 space-y-1">
                        {nav.subItems?.map((sub, subIndex) => (
                          <li key={`${type}-${index}-${subIndex}-${sub.name}`}>
                            <Link
                              href={sub.path}
                              onClick={handleLinkClick}
                              className={`group flex items-center gap-2 text-sm rounded-lg px-3 py-2 transition-all duration-200 ${isActive(sub.path)
                                ? "bg-gradient-to-r text-white font-semibold shadow-sm"
                                : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                                }`}
                              style={
                                isActive(sub.path)
                                  ? {
                                    background: `linear-gradient(135deg, ${ctaColor}, ${ctaColor}CC)`,
                                  }
                                  : {}
                              }
                            >
                              {sub.icon && <div className="w-4 h-4">{sub.icon}</div>}
                              {sub.locked && <LockedPerm className="h-4 w-4" />}
                              <span className="truncate">{sub.name}</span>
                              {sub.badge && (
                                <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                nav.path && (
                  <Link
                    href={nav.path}
                    className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium text-sm overflow-hidden ${isCurrentActive
                      ? "text-white shadow-lg transform scale-[1.02]"
                      : "hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-sm hover:scale-[1.01]"
                      }`}
                    style={
                      isCurrentActive
                        ? {
                          background: `linear-gradient(135deg, ${ctaColor}, ${ctaColor}DD)`,
                        }
                        : {}
                    }
                    onClick={handleLinkClick}
                  >
                    {/* Background glow effect for active items */}
                    {isCurrentActive && (
                      <div className="absolute inset-0 opacity-20 blur-sm" style={{ backgroundColor: ctaColor }} />
                    )}

                    <div className="relative flex items-center gap-3 w-full">
                      <div className="relative flex-shrink-0">
                        {nav.icon}
                        {nav.premium && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />
                        )}
                      </div>

                      {!isCollapsed && (
                        <div className="flex items-center justify-between w-full min-w-0">
                          <span className="truncate">{nav.name}</span>
                          <div className="flex items-center gap-2">
                            {nav.badge && (
                              <span
                                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isCurrentActive ? "bg-white/20 text-white" : "text-white"
                                  }`}
                                style={!isCurrentActive ? { backgroundColor: ctaColor } : {}}
                              >
                                {nav.badge}
                              </span>
                            )}
                            {nav.premium && !isCurrentActive && <Crown className="h-3 w-3 text-yellow-500" />}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </div>
                  </Link>
                )
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  useEffect(() => {
    if (openSubmenu) {
      setTimeout(() => {
        const key = `${openSubmenu.type}-${openSubmenu.index}`
        const el = subMenuRefs.current[key]
        if (el) {
          const h = el.scrollHeight
          setSubMenuHeights((prev) => (prev[key] === h ? prev : { ...prev, [key]: h }))
        }
      }, 0)
    }
  }, [openSubmenu])

  return (
    <aside
      className={`fixed left-0 top-[75px] z-40 flex h-[calc(100vh-75px)] flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out shadow-xl ${isExpanded || isMobileOpen ? "w-[280px]" : isHovered ? "w-[280px]" : "w-[80px]"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => {
        if (!isMobileOpen && !isExpanded) setIsHovered(true)
      }}
      onMouseLeave={() => {
        if (!isMobileOpen) setIsHovered(false)
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${ctaColor} 2px, transparent 2px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full overflow-hidden">
        {/* User Greeting Section */}
        {user?.fullName && !isCollapsed && (
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-lg"
                  style={{ backgroundColor: ctaColor }}
                >
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Welkom terug,</span>
                  {isSuperAdmin && <Crown className="h-3 w-3 text-yellow-500" />}
                </div>
                <div className="font-semibold text-gray-900 truncate">{user.fullName}</div>
                <div className="text-xs text-gray-500">Online</div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed user indicator */}
        {user?.fullName && isCollapsed && (
          <div className="p-4 flex justify-center">
            <div className="relative">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg"
                style={{ backgroundColor: ctaColor }}
              >
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">


          {/* Main Navigation */}
          <div>
            {!isCollapsed && (
              <div className="flex items-center gap-2 px-3 mb-4">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${ctaColor}15` }}
                >
                  <Sparkles className="h-3 w-3" style={{ color: ctaColor }} />
                </div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hoofdmenu</h3>
              </div>
            )}
            {renderMenuItems(navItems, "main")}
          </div>


        </nav>


        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100">
          {isCollapsed ? (
            <div className="flex flex-col gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
                <HelpCircle className="h-5 w-5 text-gray-600" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700">
                <HelpCircle className="h-4 w-4" />
                <span>Help & Support</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700">
                <Settings className="h-4 w-4" />
                <span>Instellingen</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Resize handle */}
      <div className="absolute top-1/2 -right-1 w-2 h-12 bg-gray-200 rounded-r-lg opacity-0 hover:opacity-100 transition-opacity cursor-col-resize" />
    </aside>
  )
}
