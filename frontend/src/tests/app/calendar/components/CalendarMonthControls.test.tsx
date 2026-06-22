import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import CalendarMonthControls from "@/app/calendar/components/CalendarMonthControls"

describe("CalendarMonthControls", () => {
  it("renders the month and handles navigation", () => {
    const goToPreviousMonth = vi.fn()
    const goToNextMonth = vi.fn()

    render(
      <CalendarMonthControls
        goToPreviousMonth={goToPreviousMonth}
        currentMonthLabel="June 2026"
        goToNextMonth={goToNextMonth}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Previous" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    expect(screen.getByText("June 2026")).toBeInTheDocument()
    expect(goToPreviousMonth).toHaveBeenCalledOnce()
    expect(goToNextMonth).toHaveBeenCalledOnce()
  })
})
