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

function createNotificationsModel(
  overrides: Partial<ReturnType<typeof useNotifications>> = {}
): ReturnType<typeof useNotifications> {
  return {
    notifications: [],
    error: "",
    isLoading: false,
    activeAlarm: null,
    dismissAlarm: vi.fn(),
    enableBrowserNotifications: vi.fn(),
    disableBrowserNotifications: vi.fn(),
    enableSound: vi.fn(),
    disableSound: vi.fn(),
    setNotificationSoundVolume: vi.fn(),
    setNotificationSoundType: vi.fn(),
    browserAlertsEnabled: true,
    soundEnabled: false,
    soundVolume: 0.35,
    soundType: "beep",
    canShowBrowserNotifications: true,
    browserNotificationPermission: "default",
    ...overrides,
  }
}

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders a loading state", () => {
    mockedUseNotifications.mockReturnValue(createNotificationsModel({
      isLoading: true,
    }))

    render(<NotificationBell />)

    expect(screen.getByText("Loading notifications...")).toBeInTheDocument()
  })

  it("renders a notification badge and content", () => {
    mockedUseNotifications.mockReturnValue(createNotificationsModel({
      notifications: [
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
      ],
    }))

    render(<NotificationBell />)

    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("Task due")).toBeInTheDocument()
    expect(screen.getByText("Finish report today")).toBeInTheDocument()
    expect(screen.getByText("high")).toBeInTheDocument()
  })

  it("renders the empty state", () => {
    mockedUseNotifications.mockReturnValue(createNotificationsModel())

    render(<NotificationBell />)

    expect(screen.getByText("No notifications right now.")).toBeInTheDocument()
  })
})
