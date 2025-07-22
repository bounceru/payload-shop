'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSidebar } from '../context/SidebarContext'
import { useTheme } from '../context/ThemeContext'
import { TenantSelectorClient } from '../components/TenantSelector/TenantSelector'
import { getS3Url } from '@/utils/media'
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Search, Settings, Shield, Sparkles, User, X } from 'lucide-react'

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar()
  const { branding } = useTheme()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const headerBg = branding?.headerBackgroundColor || '#1D2A36'
  const headerText = branding?.headerTextColor || '#ffffff'
  const logoUrl = getS3Url(branding?.siteLogo) || '/static/stage-pass-logo-inverted.png'

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false)
      setShowNotifications(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      toggleSidebar()
    } else {
      toggleMobileSidebar()
    }
  }

  async function handleSignOut() {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.warn('/api/users/logout failed', err)
    } finally {
      document.cookie = 'payload-tenant=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;'
      router.push('/signin')
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 w-full h-[75px] z-[99999] transition-all duration-300 ${isScrolled ? 'shadow-xl backdrop-blur-sm' : 'shadow-lg'
      }`}
      style={{
        backgroundColor: isScrolled ? `${headerBg}F0` : headerBg,
        color: headerText,
        borderBottom: `1px solid ${isScrolled ? 'rgba(255,255,255,0.1)' : 'rgba(229,231,235,0.2)'}`,
      }}
    >
      {/* Background overlay for blur effect */}
      <div className="absolute inset-0 bg-black/5 backdrop-blur-sm" />

      <div className="relative z-10 flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left Section: Sidebar toggle + Logo */}
        <div className="flex items-center gap-4">
          {/* Enhanced Mobile Menu Button */}
          <button
            className="group relative h-11 w-11 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30 md:hidden"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            <div className="relative">
              {isMobileOpen ? (
                <X className="h-5 w-5 transition-transform duration-200" />
              ) : (
                <Menu className="h-5 w-5 transition-transform duration-200" />
              )}
            </div>
            {/* Ripple effect */}
            <div
              className="absolute inset-0 rounded-xl bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150" />
          </button>

          {/* Enhanced Logo Section */}
          <Link
            href="/dashboard"
            className="group flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/30 rounded-lg p-1"
          >
            <div className="relative">
              <div
                className="absolute inset-0 bg-white/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <img
                src={logoUrl || '/placeholder.svg'}
                alt="Logo"
                className="relative h-10 w-auto object-contain filter drop-shadow-sm group-hover:drop-shadow-md transition-all duration-200"
              />
            </div>
            <div className="hidden sm:block">
              <span
                className="font-bold text-lg tracking-tight drop-shadow-sm group-hover:drop-shadow-md transition-all duration-200">
                Stagepass
              </span>
              <div className="text-xs opacity-75 -mt-1">Dashboard</div>
            </div>
          </Link>
        </div>

        {/* Center Section: Search (hidden on mobile) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-white/60" />
            </div>
            <input
              type="text"
              placeholder="Zoek tickets, instellingen... (werkt nog niet)"
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200 hover:bg-white/15"
            />
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2">
          {/* Tenant Selector - Enhanced */}
          <div className="hidden md:block min-w-[180px]">
            <div className="relative">
              <TenantSelectorClient />
            </div>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowNotifications(!showNotifications)
                setShowUserMenu(false)
              }}
              className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <Bell className="h-4 w-4" />
              {/* Notification badge */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-current" />
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Meldingen</h3>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">3 nieuw</span>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {/* Sample notifications */}
                  <div className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Nieuw evenement aangemaakt</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Je evenement "Concert in de Park" is succesvol aangemaakt
                        </p>
                        <p className="text-xs text-gray-500 mt-1">2 minuten geleden</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Alle meldingen bekijken
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30">
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowUserMenu(!showUserMenu)
                setShowNotifications(false)
              }}
              className="flex items-center gap-2 h-10 px-3 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-3 w-3" />
              </div>
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Admin User</div>
                      <div className="text-sm text-gray-600">admin@example.com</div>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Profiel</span>
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Instellingen</span>
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Beveiliging</span>
                  </button>
                </div>

                <div className="p-2 border-t border-gray-100">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left group"
                  >
                    <LogOut className="h-4 w-4 text-gray-500 group-hover:text-red-600" />
                    <span className="text-sm text-gray-700 group-hover:text-red-600">Uitloggen</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (slides down when needed) */}
      <div
        className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 transform -translate-y-full opacity-0 transition-all duration-300">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Zoeken... (werkt nog niet)"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </header>
  )
}

export default AppHeader
