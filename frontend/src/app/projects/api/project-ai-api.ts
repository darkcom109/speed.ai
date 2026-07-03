import { apiClient } from "@/lib/api-client"
import type { ProjectTaskStatus } from "@/app/projects/types/project"

export type ProjectAiMode = "generate_tasks" | "rebalance_board" | "help" | "brief"

export type ProjectAiTaskSuggestion = {
  title: string
  description?: string
  status?: ProjectTaskStatus
  accentColor?: string
  dueDate?: string | null
}

export type ProjectAiMoveSuggestion = {
  taskId: string
  status: ProjectTaskStatus
}

export type ProjectAiResponse = {
  type: ProjectAiMode
  message: string
  tasks: ProjectAiTaskSuggestion[]
  moves: ProjectAiMoveSuggestion[]
  brief?: {
    summary: string
    goals: string[]
    milestones: string[]
    firstTasks: string[]
  }
}

export async function runProjectAi(
  projectId: string,
  payload: { mode: ProjectAiMode; prompt?: string }
): Promise<ProjectAiResponse> {
  const { data } = await apiClient.post<ProjectAiResponse>(
    `/projects/${projectId}/ai`,
    payload
  )

  return data
}
