import type { ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import NotificationBell from "@/app/notifications/component/NotificationBell"
import useNotifications from "@/app/notifications/hooks/useNotifications"

vi.mock("@/app/notifications/hooks/useNotifications", () => ({
  default: vi.fn(),
}))

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}))

const mockedUseNotifications = vi.mocked(useNotifications)

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders a loading state", () => {
    mockedUseNotifications.mockReturnValue({
      notifications: [],
      error: "",
      isLoading: true,
    })

    render(<NotificationBell />)

    expect(screen.getByText("Loading notifications...")).toBeInTheDocument()
  })

  it("renders a notification badge and content", () => {
    mockedUseNotifications.mockReturnValue({
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
      error: "",
      isLoading: false,
    })

    render(<NotificationBell />)

    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("Task due")).toBeInTheDocument()
    expect(screen.getByText("Finish report today")).toBeInTheDocument()
    expect(screen.getByText("high")).toBeInTheDocument()
  })

  it("renders the empty state", () => {
    mockedUseNotifications.mockReturnValue({
      notifications: [],
      error: "",
      isLoading: false,
    })

    render(<NotificationBell />)

    expect(screen.getByText("No notifications right now.")).toBeInTheDocument()
  })
})
