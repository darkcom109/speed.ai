import type { ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import TaskPreviewDialog from "@/app/tasks/components/TaskPreviewDialog"

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: ReactNode }) => <>{children}</>,
  DialogContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogDescription: ({ children }: { children: ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: () => <footer />,
  DialogHeader: ({ children }: { children: ReactNode }) => (
    <header>{children}</header>
  ),
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}))

describe("TaskPreviewDialog", () => {
  it("shows the selected task details", () => {
    render(
      <TaskPreviewDialog
        task={{
          id: "task-1",
          title: "Build computer",
          description: "Choose and assemble the components",
          dueDate: "2026-06-22T08:00:00.000Z",
          completed: false,
          createdAt: "2026-06-21T10:00:00.000Z",
          updatedAt: "2026-06-21T10:00:00.000Z",
          userId: "user-1",
        }}
        onOpenChange={vi.fn()}
      />
    )

    expect(
      screen.getByRole("heading", { name: "Build computer" })
    ).toBeInTheDocument()
    expect(
      screen.getByText("Choose and assemble the components")
    ).toBeInTheDocument()
    expect(screen.getByText(/22 Jun 2026/)).toBeInTheDocument()
    expect(screen.getByText("Current")).toBeInTheDocument()
  })

  it("renders nothing without a selected task", () => {
    const { container } = render(
      <TaskPreviewDialog task={null} onOpenChange={vi.fn()} />
    )

    expect(container).toBeEmptyDOMElement()
  })
})
