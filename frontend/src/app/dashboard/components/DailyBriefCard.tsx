import { ListTodoIcon, WalletCardsIcon } from "lucide-react"

import type { Expense } from "@/app/expenses/types/expense"
import type { Task } from "@/app/tasks/types/task"

type DailyBriefCardProps = {
  tasks: Task[]
  expenses: Expense[]
  isLoading: boolean
}

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

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export default function DailyBriefCard({
  tasks,
  expenses,
  isLoading,
}: DailyBriefCardProps) {
  const today = new Date()
  const todayStart = startOfDay(today)
  const activeTasks = tasks.filter((task) => !task.completed)
  const dueTodayCount = activeTasks.filter((task) => {
    return task.dueDate && isSameDay(new Date(task.dueDate), today)
  }).length
  const overdueCount = activeTasks.filter((task) => {
    return task.dueDate && startOfDay(new Date(task.dueDate)) < todayStart
  }).length
  const spentToday = expenses.reduce((total, expense) => {
    const expenseDate = new Date(expense.spentAt)

    return expense.kind === "expense" && isSameDay(expenseDate, today)
      ? total + expense.amount
      : total
  }, 0)

  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold">Daily brief</h3>
        <p className="text-sm text-muted-foreground">
          A quick look at what needs attention today.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-background p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ListTodoIcon className="size-4" />
              <p className="text-xs">Due today</p>
            </div>
            <p className="mt-2 text-2xl font-semibold">{dueTodayCount}</p>
            <p className="text-xs text-muted-foreground">
              {overdueCount} overdue
            </p>
          </div>

          <div className="rounded-lg border bg-background p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <WalletCardsIcon className="size-4" />
              <p className="text-xs">Spent today</p>
            </div>
            <p className="mt-2 text-2xl font-semibold">
              {currencyFormatter.format(spentToday)}
            </p>
            <p className="text-xs text-muted-foreground">Finance activity</p>
          </div>
        </div>
      )}
    </section>
  )
}
