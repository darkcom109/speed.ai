import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import useCalendar from "@/app/calendar/hooks/use-calendar"
import { getTasks } from "@/app/tasks/api/tasks-api"
import { apiClient } from "@/lib/api-client"

const navigate = vi.fn()

vi.mock("react-router", () => ({
  useNavigate: () => navigate,
}))

vi.mock("@/app/tasks/api/tasks-api", () => ({
  getTasks: vi.fn(),
}))

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe("useCalendar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date(2026, 5, 19, 12))
    vi.mocked(apiClient.get).mockResolvedValue({ data: {} })
    vi.mocked(getTasks).mockResolvedValue([
      {
        id: "later",
        title: "Later",
        description: null,
        dueDate: new Date(2026, 5, 19, 16).toISOString(),
        completed: false,
        createdAt: "2026-06-18T10:00:00.000Z",
        updatedAt: "2026-06-18T10:00:00.000Z",
        userId: "user-1",
      },
      {
        id: "earlier",
        title: "Earlier",
        description: null,
        dueDate: new Date(2026, 5, 19, 14).toISOString(),
        completed: false,
        createdAt: "2026-06-18T10:00:00.000Z",
        updatedAt: "2026-06-18T10:00:00.000Z",
        userId: "user-1",
      },
    ])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("loads and orders tasks for each day", async () => {
    const { result } = renderHook(() => useCalendar())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const tasks = result.current.getTasksForDay(new Date(2026, 5, 19))

    expect(apiClient.get).toHaveBeenCalledWith("/auth/me")
    expect(tasks.map((task) => task.title)).toEqual(["Earlier", "Later"])
    expect(result.current.hasTasksDueThisMonth).toBe(true)
  })

  it("moves between months and reloads after task updates", async () => {
    const { result } = renderHook(() => useCalendar())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.goToNextMonth()
    })
    expect(result.current.currentMonthLabel).toBe("July 2026")

    act(() => {
      result.current.goToPreviousMonth()
    })
    expect(result.current.currentMonthLabel).toBe("June 2026")

    act(() => {
      window.dispatchEvent(new Event("tasks-updated"))
    })

    await waitFor(() => expect(getTasks).toHaveBeenCalledTimes(2))
  })
})
