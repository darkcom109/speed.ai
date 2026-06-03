import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import CalendarTaskPreviewDialog from "@/app/calendar/components/CalendarTaskPreviewDialog"
import useCalendar from "./hooks/use-calendar"

export default function CalendarPage() {
  const {
    isLoading,
    error,
    previewTask,
    setPreviewTask,
    currentMonthLabel,
    goToPreviousMonth,
    goToNextMonth,
    hasTasksDueThisMonth,
    weekDays,
    blankDays,
    days,
    today,
    isSameDay,
    getTasksForDay,
  } = useCalendar()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Calendar" />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="outline" onClick={goToPreviousMonth}>
              Previous
            </Button>

            <h3 className="text-base font-semibold">{currentMonthLabel}</h3>

            <Button type="button" variant="outline" onClick={goToNextMonth}>
              Next
            </Button>
          </div>

          {!isLoading && !error && !hasTasksDueThisMonth && (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No tasks due this month.
            </p>
          )}
          
          <div className="grid grid-cols-7">
            {weekDays.map((weekDay) => (
              <div
                key={weekDay}
                className="px-2 py-2 text-xs font-medium text-muted-foreground"
              >
                {weekDay}
              </div>
            ))}
          </div>

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
                  <div className="calendar-task-scroll max-h-[5.75rem] space-y-1 overflow-y-auto pr-1">
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

          <CalendarTaskPreviewDialog
            task={previewTask}
            onOpenChange={(open) => {
              if (!open) {
                setPreviewTask(null)
              }
            }}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
