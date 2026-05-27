import type { Task } from "@/app/tasks/types/task.ts"
import type { CreateTaskPayload } from "@/app/tasks/types/create-task-payload"

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
