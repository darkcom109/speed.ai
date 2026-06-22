import {
  DashboardSummaryCard,
  FinanceSnapshotCard,
  TaskActivityChart,
  TaskSummaryCard,
  TodayTasksCard,
} from "@/app/dashboard/components"

import useDashboard from "./hooks/use-dashboard"
import Layout from "@/components/app/Layout"

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
    <Layout>
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
    </Layout>
  )
}
