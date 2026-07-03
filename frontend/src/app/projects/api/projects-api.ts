import { apiClient } from "@/lib/api-client"

import type {
  CreateProjectPayload,
  CreateProjectTaskPayload,
  Project,
  UpdateProjectPayload,
  UpdateProjectTaskPayload,
} from "@/app/projects/types/project"

export async function getProjects(): Promise<Project[]> {
  const { data } = await apiClient.get<{ projects: Project[] }>("/projects")

  return data.projects
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const { data } = await apiClient.post<{ project: Project }>("/projects", payload)

  return data.project
}

export async function updateProject(
  projectId: string,
  payload: UpdateProjectPayload
): Promise<Project> {
  const { data } = await apiClient.patch<{ project: Project }>(
    `/projects/${projectId}`,
    payload
  )

  return data.project
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}`)
}

export async function createProjectTask(
  projectId: string,
  payload: CreateProjectTaskPayload
): Promise<Project["tasks"][number]> {
  const { data } = await apiClient.post<{ task: Project["tasks"][number] }>(
    `/projects/${projectId}/tasks`,
    payload
  )

  return data.task
}

export async function updateProjectTask(
  projectId: string,
  taskId: string,
  payload: UpdateProjectTaskPayload
): Promise<Project["tasks"][number]> {
  const { data } = await apiClient.patch<{ task: Project["tasks"][number] }>(
    `/projects/${projectId}/tasks/${taskId}`,
    payload
  )

  return data.task
}

export async function deleteProjectTask(
  projectId: string,
  taskId: string
): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/tasks/${taskId}`)
}
