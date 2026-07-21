import type { CSSProperties, ReactNode } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

type LayoutProps = {
  children: ReactNode
  title?: string
}

/**
 * Returns a reusable layout component for pages
 * 
 * @param Children: ReactNode
 * @returns Layout component for pages
 */
export default function Layout({ children, title }: LayoutProps) {
  return (
    <SidebarProvider
      className="h-svh min-h-0 overflow-hidden"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-0 overflow-hidden">
        <SiteHeader title={title} />
        <main className="flex min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto flex w-full max-w-7xl self-start flex-col gap-4 [&>*]:shrink-0">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
