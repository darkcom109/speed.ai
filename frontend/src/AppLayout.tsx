// React Router
import {
  Outlet,
} from "react-router"
import { GlobalAssistantSidebar } from "@/components/global-assistant-sidebar"


export default function AppLayout() {
  return (
    <>
      <Outlet />
      <GlobalAssistantSidebar />
    </>
  )
}