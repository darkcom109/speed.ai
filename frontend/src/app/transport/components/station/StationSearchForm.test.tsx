import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import StationSearchForm from "./StationSearchForm"

describe("StationSearchForm", () => {
  it("calls setQuery when the search input changes", () => {
    const setQuery = vi.fn()

    render(
      <StationSearchForm
        query=""
        setQuery={setQuery}
        isSearching={false}
        onSearchStations={vi.fn()}
      />
    )

    fireEvent.change(screen.getByPlaceholderText("Search station"), {
      target: { value: "Bank" },
    })

    expect(setQuery).toHaveBeenCalledWith("Bank")
  })

  it("calls submit handler when searching", () => {
    const onSearchStations = vi.fn()

    render(
      <StationSearchForm
        query="Bank"
        setQuery={vi.fn()}
        isSearching={false}
        onSearchStations={onSearchStations}
      />
    )

    const form = screen.getByPlaceholderText("Search station").closest("form")

    expect(form).not.toBeNull()

    fireEvent.submit(form as HTMLFormElement)

    expect(onSearchStations).toHaveBeenCalledOnce()
  })
})
