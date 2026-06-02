import {
  CalendarCheckIcon,
  CheckCircle2Icon,
  CircleIcon,
  ListChecksIcon,
} from "lucide-react"

import type { Task } from "@/app/tasks/types/task"
import { formatTaskDueTime } from "@/app/tasks/utils/task-date"

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

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export default function TaskOverviewStats({
  tasks,
  isLoading,
}: TaskOverviewStatsProps) {
  const today = new Date()
  const todayStart = startOfDay(today)
  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)
  const dueTodayTasks = tasks
    .filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), today))
    .sort((firstTask, secondTask) => {
      const completedOrder =
        Number(firstTask.completed) - Number(secondTask.completed)

      if (completedOrder !== 0) {
        return completedOrder
      }

      return (
        new Date(firstTask.dueDate || "").getTime() -
        new Date(secondTask.dueDate || "").getTime()
      )
    })
  const activeDueTodayTasks = dueTodayTasks.filter((task) => !task.completed)
  const overdueTasks = activeTasks.filter((task) => {
    return task.dueDate && startOfDay(new Date(task.dueDate)) < todayStart
  })
  
  const visibleTodayTasks = dueTodayTasks.slice(0, 2)

  return (
    <section className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold">Tasks</h3>

        {isLoading ? (
          <div className="mt-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-md bg-muted" />
              <div className="h-7 w-24 rounded-md bg-muted" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="h-3 rounded bg-muted" />
              <div className="h-3 rounded bg-muted" />
              <div className="h-3 rounded bg-muted" />
              <div className="h-3 rounded bg-muted" />
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted">
                <ListChecksIcon className="size-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-semibold leading-none">
                {activeTasks.length} active
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <p>
                Due today:{" "}
                <span className="text-primary">{activeDueTodayTasks.length}</span>
              </p>
              <p>Overdue: {overdueTasks.length}</p>
              <p>Completed: {completedTasks.length}</p>
              <p>Total: {tasks.length}</p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold">Today</h3>

        {isLoading ? (
          <div className="mt-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-md bg-muted" />
              <div className="h-7 w-20 rounded-md bg-muted" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 rounded bg-muted" />
              <div className="h-3 rounded bg-muted" />
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted">
                <CalendarCheckIcon className="size-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-semibold leading-none">
                {activeDueTodayTasks.length} due
              </p>
            </div>

            {visibleTodayTasks.length > 0 ? (
              <div className="mt-3 space-y-1.5">
                {visibleTodayTasks.map((task) => {
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
                            ? "min-w-0 flex-1 truncate text-muted-foreground line-through"
                            : "min-w-0 flex-1 truncate text-muted-foreground"
                        }
                      >
                        {task.title}
                      </span>
                      {task.dueDate ? (
                        <span className="shrink-0 text-muted-foreground">
                          {formatTaskDueTime(task.dueDate)}
                        </span>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Nothing due today.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
