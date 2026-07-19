import type { ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import PlanningPage from "@/app/planning/PlanningPage"

vi.mock("@/components/app/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}))

vi.mock("@/app/calendar/CalendarPage", () => ({
  CalendarContent: () => <section>Calendar planning view</section>,
}))

vi.mock("@/app/tasks/hooks/use-tasks", () => ({
  useTasks: () => ({ tasks: [] }),
}))

vi.mock("@/app/planning/components/PlanningTasksPanel", () => ({
  default: () => <section>Task planning view</section>,
}))

describe("PlanningPage", () => {
  it("renders tasks and the calendar together", () => {
    render(<PlanningPage />)

    expect(screen.getByText("Task planning view")).toBeInTheDocument()
    expect(screen.getByText("Calendar planning view")).toBeInTheDocument()
  })
})
