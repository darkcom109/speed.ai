import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  CalendarDaysIcon,
  CircleHelpIcon,
  LayoutDashboardIcon,
  NotebookTextIcon,
  SearchIcon,
  Settings2Icon,
  SquareCheckBigIcon,
} from "lucide-react"

async function getUserData() {
  const response = await fetch("http://localhost:3001/api/auth/me", {
    credentials: "include"
  })
  const data = await response.json()

  return data
}

const userData = await getUserData()

const data = {
  user: {
    name: userData.user.name,
    email: userData.user.email,
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: (
        <SquareCheckBigIcon
        />
      ),
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: (
        <CalendarDaysIcon
        />
      ),
    },
    {
      title: "Notes",
      url: "/notes",
      icon: (
        <NotebookTextIcon
        />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Get Help",
      url: "#",
      icon: (
        <CircleHelpIcon
        />
      ),
    },
    {
      title: "Search",
      url: "#",
      icon: (
        <SearchIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard">
                <span className="text-sm font-semibold tracking-tight">
                  speed.ai
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
