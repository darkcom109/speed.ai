import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getTasks } from "@/app/tasks/api/tasks-api"
import { useTasks } from "@/app/tasks/hooks/use-tasks"
import type { Task } from "@/app/tasks/types"

const navigate = vi.fn()

vi.mock("react-router", () => ({
  useNavigate: () => navigate,
}))

vi.mock("@/app/tasks/api/tasks-api", () => ({
  createTask: vi.fn(),
  deleteAllTasks: vi.fn(),
  deleteTask: vi.fn(),
  getTasks: vi.fn(),
  updateTask: vi.fn(),
}))

const tasks: Task[] = [
  {
    id: "active",
    title: "Active task",
    description: null,
    dueDate: null,
    completed: false,
    createdAt: "2026-06-14T10:00:00.000Z",
    updatedAt: "2026-06-14T10:00:00.000Z",
    userId: "user-1",
  },
  {
    id: "complete",
    title: "Completed task",
    description: null,
    dueDate: null,
    completed: true,
    createdAt: "2026-06-14T10:00:00.000Z",
    updatedAt: "2026-06-14T10:00:00.000Z",
    userId: "user-1",
  },
]

describe("useTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getTasks).mockResolvedValue(tasks)
  })

  it("loads and separates active and completed tasks", async () => {
    const { result } = renderHook(() => useTasks())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.activeTasks).toHaveLength(1)
    expect(result.current.completedTasks).toHaveLength(1)
  })

  it("filters tasks by search term", async () => {
    const { result } = renderHook(() => useTasks())

    await waitFor(() => expect(result.current.tasks).toHaveLength(2))

    act(() => result.current.setSearchTerm("completed"))

    expect(result.current.completedTasks).toHaveLength(1)
    expect(result.current.activeTasks).toHaveLength(0)
  })

  it("filters the list to completed tasks", async () => {
    const { result } = renderHook(() => useTasks())

    await waitFor(() => expect(result.current.tasks).toHaveLength(2))

    act(() => result.current.setTaskFilter("completed"))

    expect(result.current.activeTasks).toHaveLength(0)
    expect(result.current.completedTasks).toEqual([tasks[1]])
  })
})
