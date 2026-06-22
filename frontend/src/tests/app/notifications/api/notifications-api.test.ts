import { describe, expect, it, vi } from "vitest"

import { getNotifications } from "@/app/notifications/api/notifications-api"
import { apiClient } from "@/lib/api-client"

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe("getNotifications", () => {
  it("returns notifications from the API response", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        notifications: [
          {
            id: "1",
            type: "task",
            title: "Task due",
            message: "Finish report today",
            priority: "high",
            taskId: "task-1",
            dueDate: "2026-06-16T09:00:00.000Z",
          },
        ],
      },
    })

    const notifications = await getNotifications()

    expect(apiClient.get).toHaveBeenCalledWith("/notifications")
    expect(notifications).toHaveLength(1)
    expect(notifications[0]?.title).toBe("Task due")
  })
})
