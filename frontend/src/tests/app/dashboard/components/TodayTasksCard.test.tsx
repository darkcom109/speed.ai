import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import TodayTasksCard from "@/app/dashboard/components/TodayTasksCard"
import type { Task } from "@/app/tasks/types/task"

function createTask(overrides: Partial<Task>): Task {
  return {
    id: "task-1",
    title: "Task",
    description: null,
    dueDate: "2026-06-19T16:00:00.000Z",
    completed: false,
    createdAt: "2026-06-18T10:00:00.000Z",
    updatedAt: "2026-06-18T10:00:00.000Z",
    userId: "user-1",
    ...overrides,
  }
}

describe("TodayTasksCard", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 19, 12))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("orders current tasks by time before completed tasks", () => {
    render(
      <TodayTasksCard
        tasks={[
          createTask({
            id: "later",
            title: "Later",
            dueDate: "2026-06-19T16:00:00.000Z",
          }),
          createTask({
            id: "earlier",
            title: "Earlier",
            dueDate: "2026-06-19T14:00:00.000Z",
          }),
          createTask({ id: "done", title: "Completed", completed: true }),
        ]}
        error=""
        isLoading={false}
      />
    )

    expect(screen.getByText("2 due")).toBeInTheDocument()

    const visibleTitles = screen
      .getAllByText(/Earlier|Later/)
      .map((element) => element.textContent)

    expect(visibleTitles).toEqual(["Earlier", "Later"])
    expect(screen.queryByText("Completed")).not.toBeInTheDocument()
  })
})
