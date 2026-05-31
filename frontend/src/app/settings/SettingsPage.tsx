import { MonitorIcon, MoonIcon, SunIcon, UserRoundIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import type { CSSProperties } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useTheme } from "@/components/theme-provider"

type User = {
  name: string
  email: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("http://localhost:3001/api/auth/me", {
          credentials: "include",
        })

        if (!response.ok) {
          navigate("/login")
          return
        }

        const data = await response.json()
        setUser(data.user)
      } catch {
        setError("Unable to load settings")
      }
    }

    loadUser()
  }, [navigate])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Settings" />

        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage your account and workspace preferences.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Choose how speed.ai should look on this device.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Button
                    type="button"
                    variant={theme === "light" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setTheme("light")}
                  >
                    <SunIcon />
                    Light
                  </Button>
                  <Button
                    type="button"
                    variant={theme === "dark" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setTheme("dark")}
                  >
                    <MoonIcon />
                    Dark
                  </Button>
                  <Button
                    type="button"
                    variant={theme === "system" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setTheme("system")}
                  >
                    <MonitorIcon />
                    System
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Signed-in profile details for this workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <UserRoundIcon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {user?.name || "Loading..."}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {user?.email || "Fetching account details"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
