import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { useEffect } from "react"
import { useNavigate } from "react-router"

export default function DashboardPage() {

  const navigate = useNavigate()

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch("http://localhost:3001/api/auth/me", {
        credentials: "include"
      })

      if (!response.ok) {
        navigate("/login")
        return
      }
    }

    checkAuth()
  }, [navigate])
  
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Dashboard" />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Your personal overview will live here.
            </p>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
