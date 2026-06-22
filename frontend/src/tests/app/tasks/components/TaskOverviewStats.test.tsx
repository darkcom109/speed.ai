import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import TaskOverviewStats from "@/app/tasks/components/TaskOverviewStats"
import type { Task } from "@/app/tasks/types"

function createTask(overrides: Partial<Task>): Task {
  return {
    id: "task-1",
    title: "Task",
    description: null,
    dueDate: null,
    completed: false,
    createdAt: "2026-06-14T10:00:00.000Z",
    updatedAt: "2026-06-14T10:00:00.000Z",
    userId: "user-1",
    ...overrides,
  }
}

describe("TaskOverviewStats", () => {
  it("shows active, completed and total task counts", () => {
    render(
      <TaskOverviewStats
        tasks={[
          createTask({ id: "active" }),
          createTask({ id: "complete", completed: true }),
        ]}
        isLoading={false}
      />
    )

    expect(screen.getByText("1 active")).toBeInTheDocument()
    expect(screen.getByText("Completed: 1")).toBeInTheDocument()
    expect(screen.getByText("Total: 2")).toBeInTheDocument()
  })
})
