import type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
} from "@/app/tasks/types/"
import { apiClient } from "@/lib/api-client"

export async function getTasks(): Promise<Task[]> {
  const { data } = await apiClient.get<{ tasks: Task[] }>("/tasks")

  return data.tasks
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await apiClient.post<{ task: Task }>("/tasks", payload)

  return data.task
}

export async function updateTask(
  taskId: string,
  payload: UpdateTaskPayload
): Promise<Task> {
  const { data } = await apiClient.patch<{ task: Task }>(
    `/tasks/${taskId}`,
    payload
  )

  return data.task
}

export async function deleteTask(taskId: string): Promise<void> {
  await apiClient.delete<void>(`/tasks/${taskId}`)
}

export async function deleteAllTasks(): Promise<void> {
  await apiClient.delete<void>(`/tasks/delete_all`)
}
