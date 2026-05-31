import { useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { Expense } from "@/app/expenses/types/expense"

type ExpenseSpendingChartProps = {
  expenses: Expense[]
  error: string
  isLoading: boolean
}

type ChartRange = "week" | "month" | "year"

const chartConfig = {
  spent: {
    label: "Spent",
    color: "var(--primary)",
  },
  paidIn: {
    label: "Paid in",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
})

const chartRanges: { label: string; value: ChartRange }[] = [
  {
    label: "Week",
    value: "week",
  },
  {
    label: "Month",
    value: "month",
  },
  {
    label: "Year",
    value: "year",
  },
]

function isSamePeriod(firstDate: Date, secondDate: Date, range: ChartRange) {
  if (range === "year") {
    return firstDate.getFullYear() === secondDate.getFullYear()
  }

  if (range === "month") {
    return (
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth()
    )
  }

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
}

function getChartPeriods(range: ChartRange) {
  const length = range === "week" ? 7 : range === "month" ? 6 : 5
  const now = new Date()

  return Array.from({ length }, (_, index) => {
    const offset = length - 1 - index

    if (range === "week") {
      const date = new Date(now)

      date.setDate(now.getDate() - offset)
      date.setHours(0, 0, 0, 0)

      return date
    }

    if (range === "month") {
      return new Date(now.getFullYear(), now.getMonth() - offset, 1)
    }

    return new Date(now.getFullYear() - offset, 0, 1)
  })
}

function getChartLabel(date: Date, range: ChartRange) {
  if (range === "week") {
    return date.toLocaleDateString(undefined, { weekday: "short" })
  }

  if (range === "month") {
    return date.toLocaleDateString(undefined, { month: "short" })
  }

  return date.toLocaleDateString(undefined, { year: "numeric" })
}

function getChartDescription(range: ChartRange) {
  if (range === "week") {
    return "Daily spending and paid in totals"
  }

  if (range === "month") {
    return "Monthly spending and paid in totals"
  }

  return "Yearly spending and paid in totals"
}

export default function ExpenseSpendingChart({
  expenses,
  error,
  isLoading,
}: ExpenseSpendingChartProps) {
  const [range, setRange] = useState<ChartRange>("week")

  const chartData = getChartPeriods(range).map((date) => {
    const spent = expenses.reduce((total, expense) => {
      const expenseDate = new Date(expense.spentAt)

      return expense.kind === "expense" && isSamePeriod(expenseDate, date, range)
        ? total + expense.amount
        : total
    }, 0)
    const paidIn = expenses.reduce((total, expense) => {
      const expenseDate = new Date(expense.spentAt)

      return expense.kind === "income" && isSamePeriod(expenseDate, date, range)
        ? total + expense.amount
        : total
    }, 0)

    return {
      period: getChartLabel(date, range),
      spent,
      paidIn,
    }
  })
  const hasActivity = chartData.some((day) => day.spent > 0 || day.paidIn > 0)

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Spending activity</CardTitle>
          <CardDescription>{getChartDescription(range)}</CardDescription>
        </div>
        <div className="flex rounded-lg border bg-card p-1">
          {chartRanges.map((chartRange) => (
            <Button
              key={chartRange.value}
              type="button"
              variant={range === chartRange.value ? "default" : "ghost"}
              size="sm"
              className="h-7 px-3"
              onClick={() => setRange(chartRange.value)}
            >
              {chartRange.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && !error && (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {!isLoading && !error && (
          <>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-64 w-full"
            >
              <LineChart data={chartData}>
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
                  width={46}
                  tickFormatter={(value) =>
                    currencyFormatter.format(Number(value))
                  }
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="spent"
                  type="monotone"
                  stroke="var(--color-spent)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--color-spent)",
                    r: 3,
                  }}
                  activeDot={{
                    r: 5,
                  }}
                />
                <Line
                  dataKey="paidIn"
                  type="monotone"
                  stroke="var(--color-paidIn)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--color-paidIn)",
                    r: 3,
                  }}
                  activeDot={{
                    r: 5,
                  }}
                />
              </LineChart>
            </ChartContainer>

            {!hasActivity && (
              <p className="mt-3 text-sm text-muted-foreground">
                No expenses or paid in entries recorded for this range yet.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
