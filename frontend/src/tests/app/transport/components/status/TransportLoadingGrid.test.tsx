import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import TransportLoadingGrid from "@/app/transport/components/status/TransportLoadingGrid"

describe("TransportLoadingGrid", () => {
  it("renders loading placeholders", () => {
    const { container } = render(<TransportLoadingGrid />)

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(6)
  })
})
