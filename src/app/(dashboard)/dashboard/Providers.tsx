'use client'

import { SidebarProvider } from './context/SidebarContext'
import { TranslationProvider } from '@/context/TranslationsContext'
import { TenantProvider } from './context/TenantContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (

    <TranslationProvider>
      <TenantProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </TenantProvider>
    </TranslationProvider>
  )
}
