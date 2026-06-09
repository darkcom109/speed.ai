import type { CSSProperties } from "react"
import {
  CalculatorIcon,
  ChartLineIcon,
  PiggyBankIcon,
  TrendingUpIcon,
} from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
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

export default function ForecastPage() {
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
        <SiteHeader title="Forecast" />

        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Forecast</h2>
            <p className="text-sm text-muted-foreground">
              Build and test your projected savings algorithm.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <PiggyBankIcon className="size-5" />
                </div>
                <div>
                  <CardTitle>£0</CardTitle>
                  <CardDescription>Current savings</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <TrendingUpIcon className="size-5" />
                </div>
                <div>
                  <CardTitle>£0</CardTitle>
                  <CardDescription>Projected monthly net</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <CalculatorIcon className="size-5" />
                </div>
                <div>
                  <CardTitle>Baseline</CardTitle>
                  <CardDescription>Algorithm version</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Projected savings path</CardTitle>
              <CardDescription>
                Your forecast chart will live here once the calculation logic is
                ready.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                <div className="text-center">
                  <ChartLineIcon className="mx-auto size-8" />
                  <p className="mt-3">Forecast output placeholder</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Algorithm notes</CardTitle>
              <CardDescription>
                Use this section to show the inputs, assumptions, confidence,
                and explanation behind the projection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Income input</p>
                  <p className="mt-1 font-medium">Not calculated yet</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Expense input</p>
                  <p className="mt-1 font-medium">Not calculated yet</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Savings input</p>
                  <p className="mt-1 font-medium">Not calculated yet</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
