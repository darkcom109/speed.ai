import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import CalendarPage from "@/app/calendar/CalendarPage"
import useCalendar from "@/app/calendar/hooks/use-calendar"

vi.mock("@/components/app/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}))

vi.mock("@/app/calendar/hooks/use-calendar", () => ({
  default: vi.fn(),
}))

vi.mock("@/app/calendar/components", () => ({
  CalendarMonthControls: () => <section>Month controls</section>,
  CalendarWeekDays: () => <section>Week days</section>,
  CalendarGrid: () => <section>Calendar grid</section>,
  CalendarTaskPreviewDialog: () => <section>Task preview</section>,
}))

describe("CalendarPage", () => {
  it("renders calendar sections and the empty month state", () => {
    vi.mocked(useCalendar).mockReturnValue({
      isLoading: false,
      error: "",
      previewTask: null,
      setPreviewTask: vi.fn(),
      currentMonthLabel: "June 2026",
      goToPreviousMonth: vi.fn(),
      goToNextMonth: vi.fn(),
      hasTasksDueThisMonth: false,
      weekDays: [],
      blankDays: [],
      days: [],
      today: new Date(2026, 5, 19),
      isSameDay: vi.fn(),
      getTasksForDay: vi.fn().mockReturnValue([]),
    })

    render(<CalendarPage />)

    expect(screen.getByText("Month controls")).toBeInTheDocument()
    expect(
      screen.queryByText("No tasks due this month.")
    ).not.toBeInTheDocument()
    expect(screen.getByText("Week days")).toBeInTheDocument()
    expect(screen.getByText("Calendar grid")).toBeInTheDocument()
    expect(screen.getByText("Task preview")).toBeInTheDocument()
  })
})
