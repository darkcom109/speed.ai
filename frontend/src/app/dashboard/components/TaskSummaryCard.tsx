import { ListChecksIcon } from "lucide-react"

import type { Task } from "@/app/tasks/types/task"

type TaskSummaryCardProps = {
  tasks: Task[]
  error: string
  isLoading: boolean
}

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

export default function TaskSummaryCard({
  tasks,
  error,
  isLoading,
}: TaskSummaryCardProps) {
  const today = new Date()
  const todayStart = startOfDay(today)
  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)
  const dueTodayTasks = activeTasks.filter((task) => {
    return task.dueDate && isSameDay(new Date(task.dueDate), today)
  })
  const overdueTasks = activeTasks.filter((task) => {
    return task.dueDate && startOfDay(new Date(task.dueDate)) < todayStart
  })

  return (
    <section className="min-h-36 w-full rounded-lg border bg-card p-3">
      <h3 className="text-sm font-medium">Tasks</h3>

      {isLoading && !error && (
        <div className="mt-2 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-md bg-muted" />
            <div className="h-8 w-20 rounded-md bg-muted" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="h-3 rounded bg-muted" />
            <div className="h-3 rounded bg-muted" />
            <div className="h-3 rounded bg-muted" />
            <div className="h-3 rounded bg-muted" />
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {!isLoading && !error && (
        <div className="mt-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ListChecksIcon className="size-5" />
            </div>
            <p className="text-2xl font-semibold">{activeTasks.length} active</p>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <p>Due today: {dueTodayTasks.length}</p>
            <p>Overdue: {overdueTasks.length}</p>
            <p>Completed: {completedTasks.length}</p>
            <p>Total: {tasks.length}</p>
          </div>
        </div>
      )}
    </section>
  )
}
