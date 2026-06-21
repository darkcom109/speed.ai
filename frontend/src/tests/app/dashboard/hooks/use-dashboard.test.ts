import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getDashboardSummary } from "@/app/dashboard/api/dashboard-summary-api"
import useDashboard from "@/app/dashboard/hooks/use-dashboard"
import { getExpenses } from "@/app/expenses/api/expenses-api"
import { getTasks } from "@/app/tasks/api/tasks-api"
import { apiClient } from "@/lib/api-client"

const navigate = vi.fn()

vi.mock("react-router", () => ({
  useNavigate: () => navigate,
}))

vi.mock("@/app/dashboard/api/dashboard-summary-api", () => ({
  getDashboardSummary: vi.fn(),
}))

vi.mock("@/app/expenses/api/expenses-api", () => ({
  getExpenses: vi.fn(),
}))

vi.mock("@/app/tasks/api/tasks-api", () => ({
  getTasks: vi.fn(),
}))

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const task = {
  id: "task-1",
  title: "Finish dashboard",
  description: null,
  dueDate: "2026-06-19T10:00:00.000Z",
  completed: false,
  createdAt: "2026-06-18T10:00:00.000Z",
  updatedAt: "2026-06-18T10:00:00.000Z",
  userId: "user-1",
}

const expense = {
  id: "expense-1",
  title: "Train",
  amount: 12,
  kind: "expense" as const,
  category: "Transport",
  spentAt: "2026-06-19T10:00:00.000Z",
  createdAt: "2026-06-19T10:00:00.000Z",
  updatedAt: "2026-06-19T10:00:00.000Z",
  userId: "user-1",
}

describe("useDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.get).mockResolvedValue({ data: {} })
    vi.mocked(getTasks).mockResolvedValue([task])
    vi.mocked(getExpenses).mockResolvedValue([expense])
    vi.mocked(getDashboardSummary).mockResolvedValue("Summary")
  })

  it("loads dashboard data after authentication", async () => {
    const { result } = renderHook(() => useDashboard())

    await waitFor(() =>
      expect(result.current.isDashboardSummaryLoading).toBe(false)
    )

    expect(apiClient.get).toHaveBeenCalledWith("/auth/me")
    expect(result.current.tasks).toEqual([task])
    expect(result.current.expenses).toEqual([expense])
    expect(result.current.dashboardSummary).toBe("Summary")
  })

  it("refreshes the relevant data when update events fire", async () => {
    renderHook(() => useDashboard())

    await waitFor(() => expect(getDashboardSummary).toHaveBeenCalledOnce())

    act(() => {
      window.dispatchEvent(new Event("tasks-updated"))
    })

    await waitFor(() => expect(getTasks).toHaveBeenCalledTimes(2))
    expect(getDashboardSummary).toHaveBeenCalledTimes(2)

    act(() => {
      window.dispatchEvent(new Event("finances-updated"))
    })

    await waitFor(() => expect(getExpenses).toHaveBeenCalledTimes(2))
    expect(getDashboardSummary).toHaveBeenCalledTimes(3)
  })
})
