import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import TaskSummaryCard from "@/app/dashboard/components/TaskSummaryCard"
import type { Task } from "@/app/tasks/types/task"

function createTask(overrides: Partial<Task>): Task {
  return {
    id: "task-1",
    title: "Task",
    description: null,
    dueDate: null,
    completed: false,
    createdAt: "2026-06-18T10:00:00.000Z",
    updatedAt: "2026-06-18T10:00:00.000Z",
    userId: "user-1",
    ...overrides,
  }
}

describe("TaskSummaryCard", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 19, 12))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("calculates active, completed, due, and overdue counts", () => {
    render(
      <TaskSummaryCard
        tasks={[
          createTask({ id: "due", dueDate: "2026-06-19T15:00:00.000Z" }),
          createTask({ id: "overdue", dueDate: "2026-06-18T15:00:00.000Z" }),
          createTask({ id: "done", completed: true }),
        ]}
        error=""
        isLoading={false}
      />
    )

    expect(screen.getByText("2 active")).toBeInTheDocument()
    expect(screen.getByText("Due today: 1")).toBeInTheDocument()
    expect(screen.getByText("Overdue: 1")).toBeInTheDocument()
    expect(screen.getByText("Completed: 1")).toBeInTheDocument()
    expect(screen.getByText("Total: 3")).toBeInTheDocument()
  })
})
