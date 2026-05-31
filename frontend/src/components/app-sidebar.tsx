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
  CodeIcon,
  LayoutDashboardIcon,
  MessageCircleIcon,
  NotebookTextIcon,
  ReceiptTextIcon,
  Settings2Icon,
  SquareCheckBigIcon,
  TrainFrontIcon,
} from "lucide-react"

async function getUserData() {
  try {
    const response = await fetch("http://localhost:3001/api/auth/me", {
      credentials: "include"
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    return data.user
  } catch {
    return null
  }
}

const userData = await getUserData()

const data = {
  user: {
    name: userData?.name || "Guest",
    email: userData?.email || "Not signed in",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: (
            <LayoutDashboardIcon
            />
          ),
        },
      ],
    },
    {
      title: "Workspace",
      items: [
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
          title: "Finances",
          url: "/expenses",
          icon: (
            <ReceiptTextIcon
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
    },
    {
      title: "Tools",
      items: [
        {
          title: "Assistant",
          url: "/assistant",
          icon: (
            <MessageCircleIcon
            />
          ),
        },
        {
          title: "GitHub",
          url: "/github",
          icon: (
            <CodeIcon
            />
          ),
        },
        {
          title: "Transport",
          url: "/transport/status",
          icon: (
            <TrainFrontIcon
            />
          ),
          items: [
            {
              title: "Status",
              url: "/transport/status",
            },
            {
              title: "Stations",
              url: "/transport/stations",
            },
          ],
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: (
        <Settings2Icon
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
        <NavMain groups={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
