import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import RenderTaskList from "@/app/tasks/components/RenderTaskList"
import type { Task } from "@/app/tasks/types"

const task: Task = {
  id: "task-1",
  title: "Write tests",
  description: null,
  dueDate: null,
  completed: false,
  createdAt: "2026-06-14T10:00:00.000Z",
  updatedAt: "2026-06-14T10:00:00.000Z",
  userId: "user-1",
}

describe("RenderTaskList", () => {
  it("renders the empty message", () => {
    render(
      <RenderTaskList
        tasks={[]}
        emptyMessage="No tasks found."
        renderTask={() => null}
      />
    )

    expect(screen.getByText("No tasks found.")).toBeInTheDocument()
  })

  it("renders each task through the render callback", () => {
    render(
      <RenderTaskList
        tasks={[task]}
        emptyMessage="No tasks found."
        renderTask={(currentTask) => <span>{currentTask.title}</span>}
      />
    )

    expect(screen.getByText("Write tests")).toBeInTheDocument()
  })
})
