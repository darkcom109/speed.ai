import type { ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import CalendarTaskPreviewDialog from "@/app/calendar/components/CalendarTaskPreviewDialog"

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogMedia: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: ReactNode }) => (
    <h2>{children}</h2>
  ),
  AlertDialogDescription: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogCancel: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
}))

describe("CalendarTaskPreviewDialog", () => {
  it("renders the selected task details", () => {
    render(
      <CalendarTaskPreviewDialog
        task={{
          id: "task-1",
          title: "Review forecast",
          description: "Check the model output",
          dueDate: "2026-06-19T14:00:00.000Z",
          completed: false,
          createdAt: "2026-06-18T10:00:00.000Z",
          updatedAt: "2026-06-18T10:00:00.000Z",
          userId: "user-1",
        }}
        onOpenChange={vi.fn()}
      />
    )

    expect(screen.getByText("Review forecast")).toBeInTheDocument()
    expect(screen.getByText("Check the model output")).toBeInTheDocument()
    expect(screen.getByText("Current")).toBeInTheDocument()
  })
})
