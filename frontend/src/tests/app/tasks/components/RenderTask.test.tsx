import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import RenderTask from "@/app/tasks/components/RenderTask"

vi.mock("@/app/tasks/components/EditTaskDialog", () => ({
  default: () => <button type="button">Edit task</button>,
}))

vi.mock("@/app/tasks/components/DeleteTaskDialog", () => ({
  default: () => <button type="button">Delete task</button>,
}))

describe("RenderTask", () => {
  it("shows the task summary and opens its preview", () => {
    const task = {
      id: "task-1",
      title: "Build computer",
      description: "This stays available in the preview and edit dialogs",
      dueDate: "2026-06-22T08:00:00.000Z",
      completed: false,
      createdAt: "2026-06-21T10:00:00.000Z",
      updatedAt: "2026-06-21T10:00:00.000Z",
      userId: "user-1",
    }
    const onPreviewTask = vi.fn()

    render(
      <RenderTask
        task={task}
        isEditing={false}
        onPreviewTask={onPreviewTask}
        startEditingTask={vi.fn()}
        handleToggleTask={vi.fn()}
        handleDeleteTask={vi.fn()}
        handleUpdateTask={vi.fn()}
        editTitle=""
        editDescription=""
        editDueDate=""
        setEditTitle={vi.fn()}
        setEditDescription={vi.fn()}
        setEditDueDate={vi.fn()}
        setEditingTaskId={vi.fn()}
      />
    )

    expect(screen.getByText("Build computer")).toBeInTheDocument()
    expect(
      screen.queryByText("This stays available in the preview and edit dialogs")
    ).not.toBeInTheDocument()
    expect(screen.getAllByText(/22 Jun 2026/)).toHaveLength(2)

    fireEvent.click(
      screen.getByRole("button", { name: "View details for Build computer" })
    )

    expect(onPreviewTask).toHaveBeenCalledWith(task)
  })
})
