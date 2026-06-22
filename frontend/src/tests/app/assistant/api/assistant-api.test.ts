import { describe, expect, it, vi } from "vitest"

import {
  deleteAllSavedMessages,
  getAllSavedMessages,
  sendAssistantMessage,
} from "@/app/assistant/api/assistant-api"
import { apiClient } from "@/lib/api-client"

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}))

describe("assistant-api", () => {
  it("sends the message and dispatches the returned update event", async () => {
    const eventHandler = vi.fn()
    window.addEventListener("tasks-updated", eventHandler)
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        message: "Task created",
        event: "tasks-updated",
      },
    })

    await expect(sendAssistantMessage("Create a task")).resolves.toBe(
      "Task created"
    )

    expect(apiClient.post).toHaveBeenCalledWith("/assistant/chat", {
      message: "Create a task",
    })
    expect(eventHandler).toHaveBeenCalledOnce()

    window.removeEventListener("tasks-updated", eventHandler)
  })

  it("loads and deletes saved messages", async () => {
    const messages = [
      {
        id: "message-1",
        role: "assistant" as const,
        content: "Hello",
      },
    ]

    vi.mocked(apiClient.get).mockResolvedValue({ data: { messages } })
    vi.mocked(apiClient.delete).mockResolvedValue({ data: {} })

    await expect(getAllSavedMessages()).resolves.toEqual(messages)
    await expect(deleteAllSavedMessages()).resolves.toBeUndefined()

    expect(apiClient.get).toHaveBeenCalledWith("/assistant/messages")
    expect(apiClient.delete).toHaveBeenCalledWith("/assistant/messages")
  })
})
