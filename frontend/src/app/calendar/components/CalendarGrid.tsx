import type { Task } from "@/app/tasks/types/task"

export type CalendarGridProps = {
    blankDays: number[]
    days: Date[]
    today: Date
    isSameDay: (firstDate: Date, secondDate: Date) => boolean
    getTasksForDay: (day: Date) => Task[]
    setPreviewTask: (task: Task | null) => void
}

export default function CalendarGrid({
    blankDays,
    days,
    today,
    isSameDay,
    getTasksForDay,
    setPreviewTask,
} : CalendarGridProps) {
    return (
        <div className="grid grid-cols-7 rounded-lg border bg-card">
            {blankDays.map((_, index) => (
              <div key={`blank-${index}`} className="h-36 border p-2" />
            ))}

            {days.map((day) => {
              const tasksForDay = getTasksForDay(day)

              return (
                <div
                  key={day.toISOString()}
                  className={
                    isSameDay(day, today)
                      ? "h-36 overflow-hidden border bg-accent/40 p-2"
                      : "h-36 overflow-hidden border p-2"
                  }
                >
                  <div className="mb-2 flex h-6 items-start">
                    <p
                      className={
                        isSameDay(day, today)
                          ? "grid size-6 place-items-center rounded-full bg-primary text-xs font-medium leading-none text-primary-foreground"
                          : "h-6 text-sm font-medium leading-6"
                      }
                    >
                      {day.getDate()}
                    </p>
                  </div>
                  <div className="calendar-task-scroll max-h-23 space-y-1 overflow-y-auto pr-1">
                    {tasksForDay.map((task) => (
                      <button
                        type="button"
                        key={task.id}
                        className={
                          task.completed
                            ? "w-full cursor-pointer truncate rounded-md bg-muted px-2 py-0.5 text-left text-xs leading-4 text-muted-foreground line-through transition hover:bg-muted/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            : "w-full cursor-pointer truncate rounded-md bg-primary px-2 py-0.5 text-left text-xs leading-4 text-primary-foreground transition hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        }
                        onClick={() => setPreviewTask(task)}
                      >
                        {task.title}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
        </div>
    )
}
