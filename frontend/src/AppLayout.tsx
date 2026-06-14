// React Router
import { Outlet } from "react-router"
import { CommandPalette } from "@/components/command-palette"
import { GlobalAssistantSidebar } from "@/components/global-assistant-sidebar"
import { Toaster } from "@/components/ui/sonner"

export default function AppLayout() {
  return (
    <>
      <Outlet />
      <CommandPalette />
      <GlobalAssistantSidebar />
      <Toaster />
    </>
  )
}
