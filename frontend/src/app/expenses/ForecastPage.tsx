import {
  CalculatorIcon,
  PiggyBankIcon,
  TrendingUpIcon,
} from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { currencyFormatter } from "@/app/expenses/utils/expense-utils"
import Layout from "@/components/app/Layout"
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
    ? forecast.monthlyForecasts.reduce(
        (points, monthlyNet, index) => {
          const previousSavings = points.at(-1)?.savings ?? forecast.currentSavings

          points.push({
            period: `${index + 1}m`,
            savings: previousSavings + monthlyNet,
          })

          return points
        },
        [{ period: "Now", savings: forecast.currentSavings }]
      )
    : []

  return (
    <Layout title="Forecast">
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
                    Avg Monthly net
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
                {forecast
                  ? `${forecast.method} using ${forecast.historyMonths} completed months with ${forecast.confidence} confidence.`
                  : "A robust projection based on your completed finance history."}
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
                How the current estimate was calculated and how much uncertainty it carries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Forecast method</p>
                  <p className="mt-1 font-medium">
                    {forecast?.method || "Not calculated yet"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Evidence window</p>
                  <p className="mt-1 font-medium">
                    {forecast
                      ? `${forecast.historyMonths} completed months`
                      : "Not calculated yet"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">12-month estimate range</p>
                  <p className="mt-1 font-medium">
                    {forecast
                      ? `${currencyFormatter.format(forecast.ranges.twelveMonths.low)} – ${currencyFormatter.format(forecast.ranges.twelveMonths.high)}`
                      : "Not calculated yet"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
    </Layout>
  )
}
