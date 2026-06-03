import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import CalendarTaskPreviewDialog from "@/app/calendar/components/CalendarTaskPreviewDialog"
import useCalendar from "./hooks/use-calendar"
import RenderCalendar from "./components/RenderCalendar"

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

          <RenderCalendar 
            blankDays={blankDays}
            days={days}
            today={today}
            isSameDay={isSameDay}
            getTasksForDay={getTasksForDay}
            setPreviewTask={setPreviewTask}
          />

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
