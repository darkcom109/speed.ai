import {
  CalendarCheckIcon,
  CheckCircle2Icon,
  CircleIcon,
} from "lucide-react"

import type { Task } from "@/app/tasks/types/task"

type TodayTasksCardProps = {
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

export default function TodayTasksCard({
  tasks,
  error,
  isLoading,
}: TodayTasksCardProps) {
  const today = new Date()
  const todayTasks = tasks
    .filter((task) => {
      return task.dueDate && isSameDay(new Date(task.dueDate), today)
    })
    .sort((firstTask, secondTask) => {
      return Number(firstTask.completed) - Number(secondTask.completed)
    })
  const activeTodayTasks = todayTasks.filter((task) => !task.completed)
  const visibleTasks = todayTasks.slice(0, 2)
  const hiddenTaskCount = todayTasks.length - visibleTasks.length

  return (
    <section className="min-h-36 w-full rounded-lg border bg-card p-3">
      <h3 className="text-sm font-medium">Today</h3>

      {isLoading && !error && (
        <div className="mt-2 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-md bg-muted" />
            <div className="h-8 w-24 rounded-md bg-muted" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3 rounded bg-muted" />
            <div className="h-3 rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {!isLoading && !error && (
        <div className="mt-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <CalendarCheckIcon className="size-5" />
            </div>
            <p className="text-2xl font-semibold">
              {activeTodayTasks.length} due
            </p>
          </div>

          {visibleTasks.length > 0 ? (
            <div className="mt-2 space-y-1.5">
              {visibleTasks.map((task) => {
                const TaskIcon = task.completed ? CheckCircle2Icon : CircleIcon

                return (
                  <div
                    key={task.id}
                    className="flex min-w-0 items-center gap-2 text-xs"
                  >
                    <TaskIcon
                      className={
                        task.completed
                          ? "size-3.5 shrink-0 text-muted-foreground"
                          : "size-3.5 shrink-0 text-primary"
                      }
                    />
                    <span
                      className={
                        task.completed
                          ? "truncate text-muted-foreground line-through"
                          : "truncate text-muted-foreground"
                      }
                    >
                      {task.title}
                    </span>
                  </div>
                )
              })}
              {hiddenTaskCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  +{hiddenTaskCount} more
                </p>
              )}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Nothing due today.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
