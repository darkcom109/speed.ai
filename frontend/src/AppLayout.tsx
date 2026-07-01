// React Router
import { Outlet, useLocation } from "react-router"
import { useEffect } from "react"

import { CommandPalette } from "@/components/command-palette"
import { GlobalAssistantSidebar } from "@/components/global-assistant-sidebar"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "@/lib/single-toast"

function ToastNavigationCleanup() {
  const location = useLocation()

  useEffect(() => {
    toast.dismiss()
  }, [location.pathname, location.search])

  return null
}

export default function AppLayout() {
  return (
    <>
      <ToastNavigationCleanup />
      <Outlet />
      <CommandPalette />
      <GlobalAssistantSidebar />
      <Toaster />
    </>
  )
}
