import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { SavingAccount } from "@/app/expenses/types/saving-account"
import { currencyFormatter } from "@/app/expenses/utils/expense-utils"
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

type SavingsGoalChartProps = {
  savingAccounts: SavingAccount[]
  error: string
  isLoading: boolean
}

const chartConfig = {
  saved: {
    label: "Saved",
    color: "var(--primary)",
  },
  remaining: {
    label: "Remaining",
    color: "var(--muted)",
  },
} satisfies ChartConfig

function getChartHeight(accountCount: number) {
  return Math.max(220, Math.min(420, accountCount * 52 + 96))
}

export default function SavingsGoalChart({
  savingAccounts,
  error,
  isLoading,
}: SavingsGoalChartProps) {
  const chartData = savingAccounts.map((savingAccount) => {
    const targetAmount = savingAccount.targetAmount || savingAccount.currentAmount
    const remaining = Math.max(targetAmount - savingAccount.currentAmount, 0)

    return {
      account: savingAccount.name,
      saved: savingAccount.currentAmount,
      remaining,
    }
  })
  const hasAccounts = chartData.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings by account</CardTitle>
        <CardDescription>
          Saved balances compared against each account target.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && !error && (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {!isLoading && !error && !hasAccounts && (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Add a saving account to see goal progress here.
          </div>
        )}

        {!isLoading && !error && hasAccounts && (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto w-full"
            style={{ height: getChartHeight(chartData.length) }}
          >
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                left: 10,
                right: 20,
              }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  currencyFormatter.format(Number(value))
                }
              />
              <YAxis
                dataKey="account"
                type="category"
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.12 }}
                content={
                  <ChartTooltipContent
                    className="min-w-44"
                    formatter={(value, name, item) => {
                      const label = chartConfig[name as keyof typeof chartConfig]?.label
                        ?? name
                      const indicatorColor = item.color

                      return (
                        <div className="flex w-full items-center gap-3">
                          <span
                            className="size-2.5 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: indicatorColor }}
                          />
                          <span className="flex-1 text-muted-foreground">
                            {label}
                          </span>
                          <span className="font-mono font-medium text-foreground tabular-nums">
                            {currencyFormatter.format(Number(value))}
                          </span>
                        </div>
                      )
                    }}
                  />
                }
              />
              <Bar
                dataKey="saved"
                stackId="savings"
                fill="var(--color-saved)"
                radius={[4, 0, 0, 4]}
              />
              <Bar
                dataKey="remaining"
                stackId="savings"
                fill="var(--color-remaining)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
