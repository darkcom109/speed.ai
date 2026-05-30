import { useEffect, useState } from "react"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
  TrainFrontIcon,
} from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { getTflStatus } from "@/app/transport/api/tfl-api"
import type { TflLineStatus } from "@/app/transport/types/tfl-status"

const chartConfig = {
  good: {
    label: "Good service",
    color: "var(--primary)",
  },
  disrupted: {
    label: "Disrupted",
    color: "var(--destructive)",
  },
} satisfies ChartConfig

const lineColors: Record<string, string> = {
  bakerloo: "#B36305",
  central: "#E32017",
  circle: "#FFD300",
  district: "#00782A",
  "elizabeth-line": "#6950A1",
  "hammersmith-city": "#F3A9BB",
  jubilee: "#A0A5A9",
  metropolitan: "#9B0056",
  northern: "#000000",
  piccadilly: "#003688",
  victoria: "#0098D4",
  "waterloo-city": "#95CDBA",
  dlr: "#00A4A7",
  "london-overground": "#EE7C0E",
  tram: "#84B817",
}

function getStatusStyles(line: TflLineStatus) {
  if (line.status === "Good Service") {
    return {
      card: "border-border bg-card",
      icon: "bg-primary/10 text-primary",
      badge: "bg-primary/10 text-primary",
      iconComponent: CheckCircle2Icon,
    }
  }

  return {
    card: "border-destructive/40 bg-destructive/5",
    icon: "bg-destructive/10 text-destructive",
    badge: "bg-destructive/10 text-destructive",
    iconComponent: AlertTriangleIcon,
  }
}

function getLineColor(line: TflLineStatus) {
  return lineColors[line.id] || "var(--primary)"
}

function formatModeName(modeName: string) {
  return modeName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function LineStatusCard({ line, compact = false }: {
  line: TflLineStatus
  compact?: boolean
}) {
  const styles = getStatusStyles(line)
  const StatusIcon = styles.iconComponent

  return (
    <section
      className={`relative overflow-hidden rounded-lg border ${compact ? "p-3" : "p-4"} ${styles.card}`}
    >
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: getLineColor(line) }}
      />
      <div className="flex items-start gap-3 pl-2">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-md ${styles.icon}`}
        >
          <StatusIcon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium">{line.name}</h3>
              <p className="text-xs text-muted-foreground">
                {formatModeName(line.modeName)}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${styles.badge}`}
            >
              {line.status}
            </span>
          </div>
          {!compact && line.reason && (
            <p className="mt-3 line-clamp-3 text-xs text-muted-foreground">
              {line.reason}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default function TransportPage() {
  const [lines, setLines] = useState<TflLineStatus[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  async function loadTflStatus() {
    try {
      setError("")
      setIsLoading(true)

      const data = await getTflStatus()

      setLines(data.lines)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load TfL status")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTflStatus()
  }, [])

  const disruptedLines = lines.filter((line) => line.status !== "Good Service")
  const goodServiceLines = lines.filter((line) => line.status === "Good Service")
  const chartData = [
    {
      status: "Good service",
      value: goodServiceLines.length,
      fill: "var(--color-good)",
    },
    {
      status: "Disrupted",
      value: disruptedLines.length,
      fill: "var(--color-disrupted)",
    },
  ]

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
        <SiteHeader title="Transport" />

        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">TfL status</h2>
              <p className="text-sm text-muted-foreground">
                Live service status for London rail lines.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadTflStatus}
              disabled={isLoading}
            >
              <RefreshCwIcon className="size-4" />
              Refresh
            </Button>
          </div>

          <section className="grid grid-cols-[repeat(auto-fit,minmax(min(18rem,100%),1fr))] gap-4">
            <div className="flex min-h-28 items-center rounded-lg border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <TrainFrontIcon className="size-5" />
                </div>
                <div>
                  <p className="text-3xl font-semibold leading-none">
                    {lines.length}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Lines tracked
                  </p>
                </div>
              </div>
            </div>

            <div className="flex min-h-28 items-center rounded-lg border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                  <AlertTriangleIcon className="size-5" />
                </div>
                <div>
                  <p className="text-3xl font-semibold leading-none">
                    {disruptedLines.length}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Disrupted lines
                  </p>
                </div>
              </div>
            </div>

            <div className="flex min-h-28 items-center rounded-lg border bg-card p-4">
              <div className="grid w-full grid-cols-[minmax(0,1fr)_6rem] items-center gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-medium">Network split</h3>
                  <p className="text-xs text-muted-foreground">
                    Good service vs disruption
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <span className="size-2 rounded-full bg-primary" />
                      {goodServiceLines.length} good
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="size-2 rounded-full bg-destructive" />
                      {disruptedLines.length} issues
                    </span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <ChartContainer
                    config={chartConfig}
                    className="aspect-square h-24 w-24"
                  >
                    <PieChart>
                      <ChartTooltip
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="status"
                        innerRadius={28}
                        outerRadius={44}
                        strokeWidth={0}
                      >
                        {chartData.map((entry) => (
                          <Cell key={entry.status} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>
              </div>
            </div>
          </section>

          {isLoading && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-lg border bg-muted"
                />
              ))}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {!isLoading && !error && (
            <>
              <section className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium">Needs attention</h3>
                  <p className="text-xs text-muted-foreground">
                    Lines with delays, closures, or service changes.
                  </p>
                </div>
                {disruptedLines.length > 0 ? (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {disruptedLines.map((line) => (
                      <LineStatusCard key={line.id} line={line} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                    No disruptions reported.
                  </div>
                )}
              </section>

            </>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
