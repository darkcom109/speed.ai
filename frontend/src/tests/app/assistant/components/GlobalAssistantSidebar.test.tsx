import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  deleteAllSavedMessages,
  getAllSavedMessages,
  sendAssistantMessage,
} from "@/app/assistant/api/assistant-api"
import {
  assistantToggleEvent,
  GlobalAssistantSidebar,
} from "@/components/global-assistant-sidebar"

vi.mock("@/app/assistant/api/assistant-api", () => ({
  deleteAllSavedMessages: vi.fn(),
  getAllSavedMessages: vi.fn(),
  sendAssistantMessage: vi.fn(),
}))

function renderSidebar(path = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <GlobalAssistantSidebar />
    </MemoryRouter>
  )
}

describe("GlobalAssistantSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem("speed-ai-assistant-open", "true")
    vi.mocked(getAllSavedMessages).mockResolvedValue([])
    vi.mocked(deleteAllSavedMessages).mockResolvedValue(undefined)
    vi.mocked(sendAssistantMessage).mockResolvedValue("Assistant reply")

    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    })
  })

  it("loads saved messages and sends a new message", async () => {
    const user = userEvent.setup()
    vi.mocked(getAllSavedMessages).mockResolvedValue([
      {
        id: "saved-1",
        role: "assistant",
        content: "Saved reply",
      },
    ])

    renderSidebar()

    expect(await screen.findByText("Saved reply")).toBeInTheDocument()

    await user.type(
      screen.getByPlaceholderText("Ask something..."),
      "What is due?"
    )
    await user.click(screen.getByRole("button", { name: "Send message" }))

    expect(screen.getByText("What is due?")).toBeInTheDocument()
    expect(await screen.findByText("Assistant reply")).toBeInTheDocument()
    expect(sendAssistantMessage).toHaveBeenCalledWith("What is due?")
  })

  it("clears the conversation", async () => {
    const user = userEvent.setup()
    vi.mocked(getAllSavedMessages).mockResolvedValue([
      {
        id: "saved-1",
        role: "user",
        content: "Old message",
      },
    ])

    renderSidebar()

    expect(await screen.findByText("Old message")).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", { name: "Clear assistant chat" })
    )

    await waitFor(() =>
      expect(screen.queryByText("Old message")).not.toBeInTheDocument()
    )
    expect(deleteAllSavedMessages).toHaveBeenCalledOnce()
    expect(screen.getByText("Ask me about your workspace.")).toBeInTheDocument()
  })

  it("stays hidden on public routes and can toggle on private routes", async () => {
    const { unmount } = renderSidebar("/login")

    expect(
      screen.queryByRole("complementary", { name: "Assistant sidebar" })
    ).not.toBeInTheDocument()
    expect(getAllSavedMessages).not.toHaveBeenCalled()

    unmount()
    localStorage.setItem("speed-ai-assistant-open", "false")
    renderSidebar("/dashboard")

    window.dispatchEvent(new Event(assistantToggleEvent))

    expect(
      await screen.findByRole("complementary", { name: "Assistant sidebar" })
    ).toBeInTheDocument()
  })
})
