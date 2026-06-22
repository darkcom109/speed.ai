import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import TaskSection from "@/app/tasks/components/TaskSection"
import type { Task } from "@/app/tasks/types"

const activeTask: Task = {
  id: "active",
  title: "Active task",
  description: null,
  dueDate: null,
  completed: false,
  createdAt: "2026-06-14T10:00:00.000Z",
  updatedAt: "2026-06-14T10:00:00.000Z",
  userId: "user-1",
}

const completedTask: Task = {
  ...activeTask,
  id: "completed",
  title: "Completed task",
  completed: true,
}

describe("TaskSection", () => {
  it("renders current tasks and switches to marked tasks", async () => {
    const user = userEvent.setup()

    render(
      <TaskSection
        activeTasks={[activeTask]}
        completedTasks={[completedTask]}
        paginatedActiveTasks={[activeTask]}
        paginatedCompletedTasks={[completedTask]}
        activePage={1}
        completedPage={1}
        activePageCount={1}
        completedPageCount={1}
        tasksPerPage={10}
        onActivePageChange={vi.fn()}
        onCompletedPageChange={vi.fn()}
        renderTask={(task) => <span>{task.title}</span>}
      />
    )

    expect(screen.getByText("Active task")).toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: "Marked (1)" }))

    expect(screen.getByText("Completed task")).toBeInTheDocument()
  })
})
