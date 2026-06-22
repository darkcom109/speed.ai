import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import CalendarWeekDays from "@/app/calendar/components/CalendarWeekDays"

describe("CalendarWeekDays", () => {
  it("renders every weekday", () => {
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    render(<CalendarWeekDays weekDays={weekDays} />)

    for (const weekDay of weekDays) {
      expect(screen.getByText(weekDay)).toBeInTheDocument()
    }
  })
})
