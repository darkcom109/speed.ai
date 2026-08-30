import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getNotifications } from "@/app/notifications/api/notifications-api"
import useNotifications from "@/app/notifications/hooks/useNotifications"

vi.mock("@/app/notifications/api/notifications-api", () => ({
  getNotifications: vi.fn(),
}))

describe("useNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("loads notifications on mount", async () => {
    vi.mocked(getNotifications).mockResolvedValue([
      {
        id: "1",
        type: "task",
        title: "Task due",
        taskTitle: "Finish report",
        message: "Finish report today",
        priority: "high",
        taskId: "task-1",
        dueDate: "2026-06-16T09:00:00.000Z",
      },
    ])

    const { result } = renderHook(() => useNotifications())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.error).toBe("")
  })

  it("reloads notifications when tasks are updated", async () => {
    vi.mocked(getNotifications).mockResolvedValue([])

    const { result } = renderHook(() => useNotifications())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      window.dispatchEvent(new Event("tasks-updated"))
    })

    await waitFor(() => expect(getNotifications).toHaveBeenCalledTimes(2))
  })

  it("stores an error when loading fails", async () => {
    vi.mocked(getNotifications).mockRejectedValue(
      new Error("Unable to load notifications")
    )

    const { result } = renderHook(() => useNotifications())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.notifications).toHaveLength(0)
    expect(result.current.error).toBe("Unable to load notifications")
  })
})
