import type { Task } from "@/app/tasks/types/task.ts"
import type { CreateTaskPayload } from "@/app/tasks/types/create-task-payload"
import type { UpdateTaskPayload } from "../types/update-task-payload"

export async function getTasks(): Promise<Task[]> {
    const response = await fetch("http://localhost:3001/api/tasks", {
        credentials: "include",
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || "Unable to load tasks")
    }

    return data.tasks
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
    const response = await fetch("http://localhost:3001/api/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || "Unable to create task")
    }

    return data.task
}

export async function updateTask(taskId: string, payload: UpdateTaskPayload): Promise<Task> {
    const response = await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || "Unable to update task")
    }

    return data.task
}

export async function deleteTask(taskId: string): Promise<void> {
  const response = await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
    method: "DELETE",
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to delete task")
  }
}

export async function deleteAllTasks(): Promise<void> {
  const response = await fetch(`http://localhost:3001/api/tasks/delete_all`, {
    method: "DELETE",
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to delete all tasks")
  }
}