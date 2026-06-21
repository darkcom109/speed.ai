import type { ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import TaskActivityChart from "@/app/dashboard/components/TaskActivityChart"

vi.mock("recharts", () => ({
  Area: () => null,
  AreaChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
}))

vi.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
}))

describe("TaskActivityChart", () => {
  it("renders the empty and error states", () => {
    const { rerender } = render(
      <TaskActivityChart tasks={[]} error="" isLoading={false} />
    )

    expect(
      screen.getByText("No tasks due in the next 7 days.")
    ).toBeInTheDocument()

    rerender(
      <TaskActivityChart
        tasks={[]}
        error="Unable to load tasks"
        isLoading={false}
      />
    )

    expect(screen.getByText("Unable to load tasks")).toBeInTheDocument()
  })
})
