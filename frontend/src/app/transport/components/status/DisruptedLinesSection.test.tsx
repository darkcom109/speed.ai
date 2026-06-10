import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { TflLineStatus } from "@/app/transport/types/tfl-status"

import DisruptedLinesSection from "./DisruptedLinesSection"

const disruptedLine: TflLineStatus = {
  id: "district",
  name: "District",
  modeName: "tube",
  status: "Severe Delays",
  statusSeverity: 4,
  reason: "Track fault",
}

describe("DisruptedLinesSection", () => {
  it("shows an empty state when there are no disruptions", () => {
    render(<DisruptedLinesSection disruptedLines={[]} />)

    expect(screen.getByText("No disruptions reported.")).toBeInTheDocument()
  })

  it("renders disrupted lines", () => {
    render(<DisruptedLinesSection disruptedLines={[disruptedLine]} />)

    expect(screen.getByText("District")).toBeInTheDocument()
  })
})
