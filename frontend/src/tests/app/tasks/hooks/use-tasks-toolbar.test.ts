import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import useTasksToolbar from "@/app/tasks/hooks/use-tasks-toolbar"

describe("useTasksToolbar", () => {
  it("closes the create dialog after submitting", async () => {
    const handleCreateTask = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useTasksToolbar({
        handleCreateTask,
        handleDeleteAllTasks: vi.fn().mockResolvedValue(undefined),
      })
    )
    const event = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>

    act(() => result.current.setIsCreateOpen(true))

    await act(async () => {
      await result.current.handleSubmitCreateTask(event)
    })

    expect(handleCreateTask).toHaveBeenCalledWith(event)
    expect(result.current.isCreateOpen).toBe(false)
  })
})
