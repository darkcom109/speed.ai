import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import TransportHeader from "./TransportHeader"

describe("TransportHeader", () => {
  it("renders the title and refresh action", () => {
    const onRefresh = vi.fn()

    render(<TransportHeader isLoading={false} onRefresh={onRefresh} />)

    expect(screen.getByText("TfL status")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /refresh/i }))

    expect(onRefresh).toHaveBeenCalledOnce()
  })

  it("disables refresh while loading", () => {
    render(<TransportHeader isLoading={true} onRefresh={vi.fn()} />)

    expect(screen.getByRole("button", { name: /refresh/i })).toBeDisabled()
  })
})
