import { type CSSProperties } from "react"
import {
  CalculatorIcon,
  PiggyBankIcon,
  TrendingUpIcon,
} from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { currencyFormatter } from "@/app/expenses/utils/expense-utils"
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { useForecast } from "./hooks/use-forecast"

const chartConfig = {
  savings: {
    label: "Savings",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const placeholderChartData = [
  {
    period: "Now",
    savings: 0,
  },
  {
    period: "3 months",
    savings: 0,
  },
  {
    period: "6 months",
    savings: 0,
  },
  {
    period: "12 months",
    savings: 0,
  },
]

export default function ForecastPage() {
  const {
    forecast,
    error,
    isLoading,
  } = useForecast()

  const chartData = forecast
    ? [
        {
          period: "Now",
          savings: forecast.currentSavings,
        },
        {
          period: "3 months",
          savings: forecast.projections.threeMonths,
        },
        {
          period: "6 months",
          savings: forecast.projections.sixMonths,
        },
        {
          period: "12 months",
          savings: forecast.projections.twelveMonths,
        },
      ]
    : []

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
            <Card className="gap-0 py-0">
              <CardHeader className="flex flex-row items-center gap-2.5 px-3 py-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <PiggyBankIcon className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="whitespace-nowrap text-sm leading-none tracking-tight tabular-nums">
                    {forecast
                      ? currencyFormatter.format(forecast.currentSavings)
                      : currencyFormatter.format(0)}
                  </CardTitle>
                  <CardDescription className="mt-0.5 whitespace-nowrap text-xs leading-none">
                    Current savings
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="gap-0 py-0">
              <CardHeader className="flex flex-row items-center gap-2.5 px-3 py-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <TrendingUpIcon className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="whitespace-nowrap text-sm leading-none tracking-tight tabular-nums">
                    {forecast
                      ? currencyFormatter.format(forecast.monthlySavings)
                      : currencyFormatter.format(0)}
                  </CardTitle>
                  <CardDescription className="mt-0.5 whitespace-nowrap text-xs leading-none">
                    Monthly net
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="gap-0 py-0">
              <CardHeader className="flex flex-row items-center gap-2.5 px-3 py-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <CalculatorIcon className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="whitespace-nowrap text-sm leading-none tracking-tight tabular-nums">
                    {forecast
                      ? currencyFormatter.format(
                          forecast.projections.twelveMonths
                        )
                      : currencyFormatter.format(0)}
                  </CardTitle>
                  <CardDescription className="mt-0.5 whitespace-nowrap text-xs leading-none">
                    12 month forecast
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Projected savings path</CardTitle>
              <CardDescription>
                A baseline projection from your current savings and monthly net.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && !error && (
                <div className="h-72 animate-pulse rounded-lg bg-muted" />
              )}

              {error && (
                <div className="relative">
                  <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-72 w-full opacity-30"
                  >
                    <LineChart
                      data={placeholderChartData}
                      margin={{
                        left: 12,
                        right: 12,
                      }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="period"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={72}
                        tickFormatter={(value) =>
                          currencyFormatter.format(Number(value))
                        }
                      />
                      <Line
                        dataKey="savings"
                        type="monotone"
                        stroke="var(--color-savings)"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="max-w-sm rounded-lg border bg-card/95 px-4 py-3 text-center shadow-sm">
                      <p className="text-sm font-medium">
                        Forecast unavailable
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isLoading && !error && (
                <ChartContainer
                  config={chartConfig}
                  className="aspect-auto h-72 w-full"
                >
                  <LineChart
                    data={chartData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="period"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={72}
                      tickFormatter={(value) =>
                        currencyFormatter.format(Number(value))
                      }
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          indicator="line"
                          formatter={(value) => (
                            <div className="flex w-full items-center gap-3">
                              <span className="text-muted-foreground">
                                Savings
                              </span>
                              <span className="ml-auto font-mono font-medium text-foreground tabular-nums">
                                {currencyFormatter.format(Number(value))}
                              </span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Line
                      dataKey="savings"
                      type="monotone"
                      stroke="var(--color-savings)"
                      strokeWidth={2}
                      dot={{
                        fill: "var(--color-savings)",
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    />
                  </LineChart>
                </ChartContainer>
              )}
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
                  <p className="mt-1 font-medium">
                    {forecast
                      ? currencyFormatter.format(forecast.totalIncome)
                      : "Not calculated yet"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Expense input</p>
                  <p className="mt-1 font-medium">
                    {forecast
                      ? currencyFormatter.format(forecast.totalExpense)
                      : "Not calculated yet"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Savings input</p>
                  <p className="mt-1 font-medium">
                    {forecast
                      ? currencyFormatter.format(forecast.currentSavings)
                      : "Not calculated yet"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
