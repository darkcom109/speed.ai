import type { ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { TflLineStatus } from "@/app/transport/types/tfl-status"

import TransportSummaryCards from "@/app/transport/components/status/TransportSummaryCards"

vi.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
}))

vi.mock("recharts", () => ({
  Cell: () => null,
  Pie: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

function createLine(overrides: Partial<TflLineStatus> = {}): TflLineStatus {
  return {
    id: "central",
    name: "Central",
    modeName: "tube",
    status: "Good Service",
    statusSeverity: 10,
    reason: null,
    ...overrides,
  }
}

describe("TransportSummaryCards", () => {
  it("renders line summary counts", () => {
    const goodLine = createLine({ id: "central" })
    const disruptedLine = createLine({
      id: "district",
      status: "Minor Delays",
    })

    render(
      <TransportSummaryCards
        lines={[goodLine, disruptedLine]}
        goodServiceLines={[goodLine]}
        disruptedLines={[disruptedLine]}
      />
    )

    expect(screen.getByText("Lines tracked")).toBeInTheDocument()
    expect(screen.getByText("Disrupted lines")).toBeInTheDocument()
    expect(screen.getByText("1 good")).toBeInTheDocument()
    expect(screen.getByText("1 issues")).toBeInTheDocument()
  })
})
