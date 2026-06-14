import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { TflLineStatus } from "@/app/transport/types/tfl-status"

import LineStatusCard from "@/app/transport/components/status/LineStatusCard"

const line: TflLineStatus = {
  id: "central",
  name: "Central",
  modeName: "tube",
  status: "Minor Delays",
  statusSeverity: 6,
  reason: "Signal failure",
}

describe("LineStatusCard", () => {
  it("renders line status details", () => {
    render(<LineStatusCard line={line} />)

    expect(screen.getByText("Central")).toBeInTheDocument()
    expect(screen.getByText("Tube")).toBeInTheDocument()
    expect(screen.getByText("Minor Delays")).toBeInTheDocument()
    expect(screen.getByText("Signal failure")).toBeInTheDocument()
  })
})
