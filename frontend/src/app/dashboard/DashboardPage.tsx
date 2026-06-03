import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import DashboardSummaryCard from "@/app/dashboard/components/DashboardSummaryCard"
import FinanceSnapshotCard from "@/app/dashboard/components/FinanceSnapshotCard"
import TaskActivityChart from "@/app/dashboard/components/TaskActivityChart"
import TaskSummaryCard from "@/app/dashboard/components/TaskSummaryCard"
import TodayTasksCard from "@/app/dashboard/components/TodayTasksCard"

import useDashboard from "./hooks/use-dashboard"

export default function DashboardPage() {
  const {
      tasks,
      tasksError,
      isTasksLoading,
      expenses,
      expensesError,
      isExpensesLoading,
      dashboardSummary,
      dashboardSummaryError,
      isDashboardSummaryLoading,
  } = useDashboard()

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
        <SiteHeader title="Dashboard" />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              A live overview of your workspace.
            </p>
          </div>

          <TaskActivityChart
            tasks={tasks}
            error={tasksError}
            isLoading={isTasksLoading}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TaskSummaryCard
              tasks={tasks}
              error={tasksError}
              isLoading={isTasksLoading}
            />
            <TodayTasksCard
              tasks={tasks}
              error={tasksError}
              isLoading={isTasksLoading}
            />
          </div>

          <FinanceSnapshotCard
            expenses={expenses}
            error={expensesError}
            isLoading={isExpensesLoading}
          />

          <DashboardSummaryCard
            summary={dashboardSummary}
            error={dashboardSummaryError}
            isLoading={isDashboardSummaryLoading}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
