import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import CalendarGrid from "@/app/calendar/components/CalendarGrid"
import type { Task } from "@/app/tasks/types/task"

const task: Task = {
  id: "task-1",
  title: "Calendar task",
  description: null,
  dueDate: "2026-06-19T14:00:00.000Z",
  completed: false,
  createdAt: "2026-06-18T10:00:00.000Z",
  updatedAt: "2026-06-18T10:00:00.000Z",
  userId: "user-1",
}

describe("CalendarGrid", () => {
  it("renders tasks and selects a task for preview", () => {
    const setPreviewTask = vi.fn()
    const day = new Date(2026, 5, 19)

    render(
      <CalendarGrid
        blankDays={[0]}
        days={[day]}
        today={day}
        isSameDay={() => true}
        getTasksForDay={() => [task]}
        setPreviewTask={setPreviewTask}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Calendar task" }))

    expect(screen.getByText("19")).toBeInTheDocument()
    expect(setPreviewTask).toHaveBeenCalledWith(task)
  })
})
