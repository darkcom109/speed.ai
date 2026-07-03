export type ProjectStatus = "active" | "paused" | "done"

export type ProjectTaskStatus = "backlog" | "next" | "in_progress" | "done"

export type ProjectTask = {
  id: string
  title: string
  description: string | null
  status: ProjectTaskStatus
  accentColor: string | null
  order: number
  dueDate: string | null
  createdAt: string
  updatedAt: string
  projectId: string
}

export type Project = {
  id: string
  title: string
  description: string | null
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  userId: string
  tasks: ProjectTask[]
}

export type CreateProjectPayload = {
  title: string
  description?: string
  status?: ProjectStatus
}

export type UpdateProjectPayload = {
  title?: string
  description?: string
  status?: ProjectStatus
}

export type CreateProjectTaskPayload = {
  title: string
  description?: string
  status?: ProjectTaskStatus
  accentColor?: string
  dueDate?: string
}

export type UpdateProjectTaskPayload = {
  title?: string
  description?: string
  status?: ProjectTaskStatus
  accentColor?: string
  dueDate?: string | null
}
