import { CircleDollarSignIcon } from "lucide-react"

import type { Expense } from "@/app/expenses/types/expense"

type FinanceSnapshotCardProps = {
  expenses: Expense[]
  error: string
  isLoading: boolean
}

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
})

function isSameMonth(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth()
  )
}

function getTopCategory(expenses: Expense[]) {
  const totals = new Map<string, number>()

  for (const expense of expenses) {
    if (expense.kind !== "expense") {
      continue
    }

    totals.set(
      expense.category || "General",
      (totals.get(expense.category || "General") || 0) + expense.amount
    )
  }

  return [...totals.entries()].sort((first, second) => second[1] - first[1])[0]
}

export default function FinanceSnapshotCard({
  expenses,
  error,
  isLoading,
}: FinanceSnapshotCardProps) {
  const now = new Date()
  const thisMonthExpenses = expenses.filter((expense) =>
    isSameMonth(new Date(expense.spentAt), now)
  )
  const income = thisMonthExpenses.reduce((total, expense) => {
    return expense.kind === "income" ? total + expense.amount : total
  }, 0)
  const spent = thisMonthExpenses.reduce((total, expense) => {
    return expense.kind === "expense" ? total + expense.amount : total
  }, 0)
  const balance = income - spent
  const topCategory = getTopCategory(thisMonthExpenses)

  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CircleDollarSignIcon className="size-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold">Finance snapshot</h3>
          <p className="text-sm text-muted-foreground">This month's money flow.</p>
        </div>
      </div>

      {isLoading && !error && (
        <div className="mt-4 space-y-3">
          <div className="h-8 w-28 animate-pulse rounded bg-muted" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-12 animate-pulse rounded bg-muted" />
            <div className="h-12 animate-pulse rounded bg-muted" />
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {!isLoading && !error && (
        <div className="mt-4">
          <p className="text-3xl font-semibold">
            {currencyFormatter.format(balance)}
          </p>
          <p className="text-xs text-muted-foreground">Current balance</p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="mt-1 font-semibold text-emerald-500">
                {currencyFormatter.format(income)}
              </p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs text-muted-foreground">Spent</p>
              <p className="mt-1 font-semibold">
                {currencyFormatter.format(spent)}
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Top category:{" "}
            <span className="font-medium text-foreground">
              {topCategory ? topCategory[0] : "None yet"}
            </span>
          </p>
        </div>
      )}
    </section>
  )
}
