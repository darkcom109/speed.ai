import {
  CalendarGrid,
  CalendarMonthControls,
  CalendarTaskPreviewDialog,
  CalendarWeekDays,
} from "@/app/calendar/components"
import useCalendar from "@/app/calendar/hooks/use-calendar"
import Layout from "@/components/app/Layout"

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
    <Layout>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <CalendarMonthControls 
        goToPreviousMonth={goToPreviousMonth}
        currentMonthLabel={currentMonthLabel}
        goToNextMonth={goToNextMonth}
      />

      {!isLoading && !error && !hasTasksDueThisMonth && (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No tasks due this month.
        </p>
      )}
      
      <CalendarWeekDays 
        weekDays={weekDays}
      />

      <CalendarGrid 
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
    </Layout>
  )
}
