import { AlertTriangleIcon, CalendarClockIcon } from "lucide-react"

import type { Task } from "@/app/tasks/types/task"

type TaskOverviewStatsProps = {
  tasks: Task[]
  isLoading: boolean
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
}

export default function TaskOverviewStats({
  tasks,
  isLoading,
}: TaskOverviewStatsProps) {
  const now = new Date()
  const activeTasks = tasks.filter((task) => !task.completed)
  const dueTodayCount = activeTasks.filter((task) => {
    return task.dueDate && isSameDay(new Date(task.dueDate), now)
  }).length
  const overdueCount = activeTasks.filter((task) => {
    return task.dueDate && new Date(task.dueDate) < now
  }).length

  const stats = [
    {
      label: "Due today",
      value: dueTodayCount,
      caption: "Needs attention",
      icon: CalendarClockIcon,
    },
    {
      label: "Overdue",
      value: overdueCount,
      caption: overdueCount > 0 ? "Needs action" : "Clear",
      icon: AlertTriangleIcon,
    },
  ]

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <div key={stat.label} className="rounded-lg border bg-card p-4">
            {isLoading ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                  <div className="size-10 animate-pulse rounded-md bg-muted" />
                </div>
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Icon className="size-5 text-muted-foreground" />
                </span>
                </div>
                <p className="mt-3 text-3xl font-semibold leading-none">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.caption}
                </p>
              </>
            )}
          </div>
        )
      })}
    </section>
  )
}
