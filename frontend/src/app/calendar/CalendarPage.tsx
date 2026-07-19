import {
  CalendarGrid,
  CalendarMonthControls,
  CalendarTaskPreviewDialog,
  CalendarWeekDays,
} from "@/app/calendar/components"
import useCalendar from "@/app/calendar/hooks/use-calendar"
import type { Task } from "@/app/tasks/types"
import Layout from "@/components/app/Layout"
import { cn } from "@/lib/utils"

export default function CalendarPage() {
  return (
    <Layout>
      <CalendarContent />
    </Layout>
  )
}

export function CalendarContent({
  tasks,
  embedded = false,
}: {
  tasks?: Task[]
  embedded?: boolean
}) {
  const {
    error,
    previewTask,
    setPreviewTask,
    currentMonthLabel,
    goToPreviousMonth,
    goToNextMonth,
    weekDays,
    blankDays,
    days,
    today,
    isSameDay,
    getTasksForDay,
  } = useCalendar(tasks)

  return (
    <div
      className={cn(
        embedded
          ? "flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card xl:h-full"
          : "flex flex-col gap-4"
      )}
    >
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div
        className={cn(embedded && "flex min-h-16 items-center border-b px-3")}
      >
        <div className="w-full">
          <CalendarMonthControls
            goToPreviousMonth={goToPreviousMonth}
            currentMonthLabel={currentMonthLabel}
            goToNextMonth={goToNextMonth}
          />
        </div>
      </div>

      <div className={cn(embedded && "min-h-0 flex-1 overflow-y-auto")}>
        <CalendarWeekDays weekDays={weekDays} embedded={embedded} />

        <CalendarGrid
          blankDays={blankDays}
          days={days}
          today={today}
          isSameDay={isSameDay}
          getTasksForDay={getTasksForDay}
          setPreviewTask={setPreviewTask}
          embedded={embedded}
        />
      </div>

      <CalendarTaskPreviewDialog
        task={previewTask}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewTask(null)
          }
        }}
      />
    </div>
  )
}
