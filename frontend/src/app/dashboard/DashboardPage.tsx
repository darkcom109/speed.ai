import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { getDashboardSummary } from "@/app/dashboard/api/dashboard-summary-api"
import DashboardSummaryCard from "@/app/dashboard/components/DashboardSummaryCard"
import FinanceSnapshotCard from "@/app/dashboard/components/FinanceSnapshotCard"
import TaskActivityChart from "@/app/dashboard/components/TaskActivityChart"
import TaskSummaryCard from "@/app/dashboard/components/TaskSummaryCard"
import TodayTasksCard from "@/app/dashboard/components/TodayTasksCard"
import { getExpenses } from "@/app/expenses/api/expenses-api"
import type { Expense } from "@/app/expenses/types/expense"
import { getTasks } from "@/app/tasks/api/tasks-api"
import type { Task } from "@/app/tasks/types/task"

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksError, setTasksError] = useState("")
  const [isTasksLoading, setIsTasksLoading] = useState(true)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expensesError, setExpensesError] = useState("")
  const [isExpensesLoading, setIsExpensesLoading] = useState(true)
  const [dashboardSummary, setDashboardSummary] = useState("")
  const [dashboardSummaryError, setDashboardSummaryError] = useState("")
  const [isDashboardSummaryLoading, setIsDashboardSummaryLoading] = useState(true)

  const navigate = useNavigate()

  async function loadTasks() {
    try {
      const tasks = await getTasks()

      setTasks(tasks)
    } catch {
      setTasksError("Unable to load tasks")
    } finally {
      setIsTasksLoading(false)
    }
  }

  async function loadExpenses() {
    try {
      const expenses = await getExpenses()

      setExpenses(expenses)
    } catch (error) {
      setExpensesError("Unable to load finances")
    } finally {
      setIsExpensesLoading(false)
    }
  }

  async function loadDashboardSummary() {
    try {
      setDashboardSummaryError("")
      setIsDashboardSummaryLoading(true)

      const summary = await getDashboardSummary()

      setDashboardSummary(summary)
    } catch (error) {
      setDashboardSummaryError(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard summary"
      )
    } finally {
      setIsDashboardSummaryLoading(false)
    }
  }

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch("http://localhost:3001/api/auth/me", {
        credentials: "include",
      })

      if (!response.ok) {
        navigate("/login")
        return
      }

      loadTasks()
      loadExpenses()
      loadDashboardSummary()
    }

    checkAuth()
  }, [navigate])

  useEffect(() => {
    function handleTasksUpdated() {
      void loadTasks()
      void loadDashboardSummary()
    }

    function handleFinancesUpdated() {
      void loadExpenses()
      void loadDashboardSummary()
    }

    window.addEventListener("tasks-updated", handleTasksUpdated)
    window.addEventListener("finances-updated", handleFinancesUpdated)

    return () => {
      window.removeEventListener("tasks-updated", handleTasksUpdated)
      window.removeEventListener("finances-updated", handleFinancesUpdated)
    }
  }, [])

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
