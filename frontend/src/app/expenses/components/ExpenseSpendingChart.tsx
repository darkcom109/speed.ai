import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

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
import type { Expense } from "@/app/expenses/types/expense"

type ExpenseSpendingChartProps = {
  expenses: Expense[]
  error: string
  isLoading: boolean
}

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

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
}

function getLastSevenDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    date.setHours(0, 0, 0, 0)

    return date
  })
}

export default function ExpenseSpendingChart({
  expenses,
  error,
  isLoading,
}: ExpenseSpendingChartProps) {
  const chartData = getLastSevenDays().map((date) => {
    const spent = expenses.reduce((total, expense) => {
      const expenseDate = new Date(expense.spentAt)

      return expense.kind === "expense" && isSameDay(expenseDate, date)
        ? total + expense.amount
        : total
    }, 0)
    const paidIn = expenses.reduce((total, expense) => {
      const expenseDate = new Date(expense.spentAt)

      return expense.kind === "income" && isSameDay(expenseDate, date)
        ? total + expense.amount
        : total
    }, 0)

    return {
      day: date.toLocaleDateString(undefined, { weekday: "short" }),
      spent,
      paidIn,
    }
  })
  const hasActivity = chartData.some((day) => day.spent > 0 || day.paidIn > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending activity</CardTitle>
        <CardDescription>Daily spending and paid in totals</CardDescription>
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
                  dataKey="day"
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
                No expenses or paid in entries recorded this week yet.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
