import type { ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useTasks } from "@/app/tasks/hooks/use-tasks"
import TasksPage from "@/app/tasks/TasksPage"

vi.mock("@/app/tasks/hooks/use-tasks", () => ({
  useTasks: vi.fn(),
}))

vi.mock("@/components/app/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}))

vi.mock("@/app/tasks/components", () => ({
  TasksHeader: () => <h1>Tasks</h1>,
  TaskOverviewStats: () => <section>Task overview</section>,
  TasksToolbar: () => <section>Task toolbar</section>,
  RenderTask: () => <article>Task item</article>,
  TaskSection: () => <section>Task section</section>,
  TaskPreviewDialog: () => <section>Task preview</section>,
}))

const mockedUseTasks = vi.mocked(useTasks)
const noop = vi.fn()
const noopAsync = vi.fn().mockResolvedValue(undefined)

describe("TasksPage", () => {
  it("renders the task page sections and error state", () => {
    mockedUseTasks.mockReturnValue({
      tasks: [],
      error: "Unable to retrieve tasks",
      isLoading: false,
      editingTaskId: null,
      editTitle: "",
      editDescription: "",
      editDueDate: "",
      title: "",
      description: "",
      dueDate: "",
      searchTerm: "",
      activePage: 1,
      completedPage: 1,
      taskFilter: "all",
      activeTasks: [],
      completedTasks: [],
      paginatedActiveTasks: [],
      paginatedCompletedTasks: [],
      activePageCount: 1,
      completedPageCount: 1,
      tasksPerPage: 10,
      setTitle: noop,
      setDescription: noop,
      setDueDate: noop,
      setEditTitle: noop,
      setEditDescription: noop,
      setEditDueDate: noop,
      setEditingTaskId: noop,
      setSearchTerm: noop,
      handleCreateTask: noopAsync,
      handleToggleTask: noopAsync,
      startEditingTask: noop,
      handleUpdateTask: noopAsync,
      handleDeleteTask: noopAsync,
      handleDeleteAllTasks: noopAsync,
      setActivePage: noop,
      setCompletedPage: noop,
      setTaskFilter: noop,
    })

    render(<TasksPage />)

    expect(screen.getByRole("heading", { name: "Tasks" })).toBeInTheDocument()
    expect(screen.getByText("Task overview")).toBeInTheDocument()
    expect(screen.getByText("Task toolbar")).toBeInTheDocument()
    expect(screen.getByText("Task section")).toBeInTheDocument()
    expect(screen.getByText("Task preview")).toBeInTheDocument()
    expect(screen.getByText("Unable to retrieve tasks")).toBeInTheDocument()
  })
})
