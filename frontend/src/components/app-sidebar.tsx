import * as React from "react"
import { apiClient } from "@/lib/api-client"

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
  NotebookTextIcon,
  ReceiptTextIcon,
  Settings2Icon,
  SquareCheckBigIcon,
  TrainFrontIcon,
} from "lucide-react"
import type { UserData } from "@/app/login/types/user-data"

async function getUserData() {
  try {
    const { data } = await apiClient.get<{ user: UserData}>("/auth/me")

    return data.user
  } catch {
    return null
  }
}

type SidebarUser = {
  name: string
  email: string
  avatar: string
}

const data = {
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
          items: [
            {
              title: "Overview",
              url: "/expenses",
            },
            {
              title: "Savings",
              url: "/expenses/savings",
            },
            {
              title: "Forecast",
              url: "/expenses/forecast",
            },
          ],
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
  const [user, setUser] = React.useState<SidebarUser>({
    name: "Guest",
    email: "Not signed in",
    avatar: "/avatars/shadcn.jpg",
  })

  React.useEffect(() => {
    let isMounted = true

    async function loadUser() {
      const userData = await getUserData()

      if (!isMounted) {
        return
      }

      setUser({
        name: userData?.name || "Guest",
        email: userData?.email || "Not signed in",
        avatar: "/avatars/shadcn.jpg",
      })
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

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
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
