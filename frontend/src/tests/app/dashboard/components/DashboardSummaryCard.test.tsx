import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import DashboardSummaryCard from "@/app/dashboard/components/DashboardSummaryCard"

describe("DashboardSummaryCard", () => {
  it("renders summary and error states", () => {
    const { rerender } = render(
      <DashboardSummaryCard
        summary="You have two tasks due."
        error=""
        isLoading={false}
      />
    )

    expect(screen.getByText("You have two tasks due.")).toBeInTheDocument()

    rerender(
      <DashboardSummaryCard
        summary=""
        error="Summary unavailable"
        isLoading={false}
      />
    )

    expect(screen.getByText("Summary unavailable")).toBeInTheDocument()
  })
})
