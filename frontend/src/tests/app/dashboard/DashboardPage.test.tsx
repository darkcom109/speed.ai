import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import DashboardPage from "@/app/dashboard/DashboardPage"
import useDashboard from "@/app/dashboard/hooks/use-dashboard"

vi.mock("@/components/app/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}))

vi.mock("@/app/dashboard/hooks/use-dashboard", () => ({
  default: vi.fn(),
}))

vi.mock("@/app/dashboard/components", () => ({
  TaskActivityChart: () => <section>Task activity</section>,
  TaskSummaryCard: () => <section>Task summary</section>,
  TodayTasksCard: () => <section>Today tasks</section>,
  FinanceSnapshotCard: () => <section>Finance snapshot</section>,
  DashboardSummaryCard: () => <section>Dashboard summary</section>,
}))

describe("DashboardPage", () => {
  it("renders every dashboard section", () => {
    vi.mocked(useDashboard).mockReturnValue({
      tasks: [],
      tasksError: "",
      isTasksLoading: false,
      expenses: [],
      expensesError: "",
      isExpensesLoading: false,
      dashboardSummary: "",
      dashboardSummaryError: "",
      isDashboardSummaryLoading: false,
    })

    render(<DashboardPage />)

    expect(
      screen.getByRole("heading", { name: "Dashboard" })
    ).toBeInTheDocument()
    expect(screen.getByText("Task activity")).toBeInTheDocument()
    expect(screen.getByText("Task summary")).toBeInTheDocument()
    expect(screen.getByText("Today tasks")).toBeInTheDocument()
    expect(screen.getByText("Finance snapshot")).toBeInTheDocument()
    expect(screen.getByText("Dashboard summary")).toBeInTheDocument()
  })
})
