import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import RenderPagination from "@/app/tasks/components/RenderPagination"

describe("RenderPagination", () => {
  it("changes page when Next is pressed", () => {
    const onPageChange = vi.fn()

    render(
      <RenderPagination
        currentPage={1}
        pageCount={2}
        totalTasks={12}
        tasksPerPage={10}
        onPageChange={onPageChange}
      />
    )

    expect(screen.getByText("Showing 1-10 of 12")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it("does not render when pagination is unnecessary", () => {
    const { container } = render(
      <RenderPagination
        currentPage={1}
        pageCount={1}
        totalTasks={5}
        tasksPerPage={10}
        onPageChange={vi.fn()}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })
})
