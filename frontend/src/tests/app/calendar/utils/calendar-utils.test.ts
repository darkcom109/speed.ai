import { describe, expect, it } from "vitest"

import {
  getBlankDays,
  getDateKey,
  getMonthDays,
  getMonthKey,
  getMonthLabel,
  isSameDay,
} from "@/app/calendar/utils/calendar-utils"

describe("calendar-utils", () => {
  it("formats date and month keys", () => {
    expect(getDateKey(new Date(2026, 5, 9))).toBe("2026-06-09")
    expect(getMonthKey(2026, 5)).toBe("2026-06")
  })

  it("builds the days and leading blanks for a month", () => {
    const days = getMonthDays(2026, 5)

    expect(days).toHaveLength(30)
    expect(days[0]?.getDate()).toBe(1)
    expect(days.at(-1)?.getDate()).toBe(30)
    expect(getBlankDays(2026, 5)).toHaveLength(1)
  })

  it("compares days and formats the month label", () => {
    expect(isSameDay(new Date(2026, 5, 19, 8), new Date(2026, 5, 19, 20))).toBe(
      true
    )
    expect(isSameDay(new Date(2026, 5, 19), new Date(2026, 5, 20))).toBe(false)
    expect(getMonthLabel(new Date(2026, 5, 1))).toBe("June 2026")
  })
})
