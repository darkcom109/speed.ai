import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import StationHeader from "./StationHeader"

describe("StationHeader", () => {
  it("renders the station arrivals heading", () => {
    render(<StationHeader />)

    expect(screen.getByText("Station arrivals")).toBeInTheDocument()
  })
})
