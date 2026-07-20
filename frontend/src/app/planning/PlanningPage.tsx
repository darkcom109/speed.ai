import { CalendarContent } from "@/app/calendar/CalendarPage"
import PlanningTasksPanel from "@/app/planning/components/PlanningTasksPanel"
import { useTasks } from "@/app/tasks/hooks/use-tasks"
import Layout from "@/components/app/Layout"

export default function PlanningPage() {
  const tasks = useTasks()

  return (
    <Layout title="Planning">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Planning</h1>
        <p className="text-sm text-muted-foreground">
          Manage tasks alongside every upcoming deadline.
        </p>
      </div>

      <div className="grid min-h-0 gap-4 xl:h-[min(964px,calc(100vh-8.5rem))] xl:grid-cols-[minmax(18rem,1fr)_minmax(0,3fr)] xl:items-stretch">
        <PlanningTasksPanel model={tasks} />
        <section className="min-w-0 xl:h-full">
          <CalendarContent tasks={tasks.tasks} embedded />
        </section>
      </div>
    </Layout>
  )
}
