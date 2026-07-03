import { useCallback, useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import axios from "axios"
import { useNavigate } from "react-router"

import {
  createProject,
  createProjectTask,
  deleteProject,
  deleteProjectTask,
  getProjects,
  updateProject,
  updateProjectTask,
} from "@/app/projects/api/projects-api"
import type {
  CreateProjectPayload,
  CreateProjectTaskPayload,
  Project,
  ProjectStatus,
  ProjectTask,
  ProjectTaskStatus,
  UpdateProjectPayload,
  UpdateProjectTaskPayload,
} from "@/app/projects/types/project"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/lib/single-toast"

const defaultProjectStatus: ProjectStatus = "active"
const defaultTaskStatus: ProjectTaskStatus = "backlog"
const defaultTaskAccentColor = "#3b82f6"

const projectFilters: Array<{ label: string; value: "all" | ProjectStatus }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Done", value: "done" },
]

function sortProjectsByUpdatedAt(projects: Project[]) {
  return [...projects].sort((leftProject, rightProject) => {
    return (
      new Date(rightProject.updatedAt).getTime() -
      new Date(leftProject.updatedAt).getTime()
    )
  })
}

type UseProjectsOptions = {
  initialSelectedProjectId?: string
}

export function useProjects(options: UseProjectsOptions = {}) {
  const { initialSelectedProjectId = "" } = options
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState(initialSelectedProjectId)
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState<"all" | ProjectStatus>("all")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [projectTitle, setProjectTitle] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>(defaultProjectStatus)

  const [editProjectTitle, setEditProjectTitle] = useState("")
  const [editProjectDescription, setEditProjectDescription] = useState("")
  const [editProjectStatus, setEditProjectStatus] = useState<ProjectStatus>(defaultProjectStatus)

  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskStatus, setTaskStatus] = useState<ProjectTaskStatus>(defaultTaskStatus)
  const [taskAccentColor, setTaskAccentColor] = useState(defaultTaskAccentColor)
  const [taskDueDate, setTaskDueDate] = useState("")

  const navigate = useNavigate()

  const selectedProject = useMemo(() => {
    return projects.find((project) => project.id === selectedProjectId) || null
  }, [projects, selectedProjectId])

  const filteredProjects = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()

    return projects.filter((project) => {
      const matchesFilter =
        projectFilter === "all" || project.status === projectFilter

      const matchesSearch =
        !normalizedSearchTerm ||
        project.title.toLowerCase().includes(normalizedSearchTerm) ||
        project.description?.toLowerCase().includes(normalizedSearchTerm) ||
        project.tasks.some((task) => {
          return (
            task.title.toLowerCase().includes(normalizedSearchTerm) ||
            task.description?.toLowerCase().includes(normalizedSearchTerm)
          )
        })

      return matchesFilter && matchesSearch
    })
  }, [projectFilter, projects, searchTerm])

  const projectCounts = useMemo(() => {
    const active = projects.filter((project) => project.status === "active").length
    const paused = projects.filter((project) => project.status === "paused").length
    const done = projects.filter((project) => project.status === "done").length

    return { active, paused, done }
  }, [projects])

  const loadProjects = useCallback(async () => {
    try {
      setError("")

      await apiClient.get("/auth/me")

      const loadedProjects = await getProjects()
      setProjects(sortProjectsByUpdatedAt(loadedProjects))
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/login")
        return
      }

      setError(
        error instanceof Error ? error.message : "Unable to load projects"
      )
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    void loadProjects()
  }, [loadProjects])

  useEffect(() => {
    if (projects.length === 0) {
      setSelectedProjectId("")
      return
    }

    if (initialSelectedProjectId) {
      setSelectedProjectId(initialSelectedProjectId)
      return
    }

    if (!selectedProjectId || !projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id)
    }
  }, [initialSelectedProjectId, projects, selectedProjectId])

  useEffect(() => {
    if (!selectedProject) {
      setEditProjectTitle("")
      setEditProjectDescription("")
      setEditProjectStatus(defaultProjectStatus)
      setTaskTitle("")
      setTaskDescription("")
      setTaskStatus(defaultTaskStatus)
      setTaskAccentColor(defaultTaskAccentColor)
      setTaskDueDate("")
      return
    }

    setEditProjectTitle(selectedProject.title)
    setEditProjectDescription(selectedProject.description || "")
    setEditProjectStatus(selectedProject.status)
    setTaskTitle("")
    setTaskDescription("")
    setTaskStatus(defaultTaskStatus)
    setTaskAccentColor(defaultTaskAccentColor)
    setTaskDueDate("")
  }, [selectedProject?.id])

  function replaceProject(nextProject: Project) {
    setProjects((currentProjects) =>
      sortProjectsByUpdatedAt(
        currentProjects.map((project) =>
          project.id === nextProject.id ? nextProject : project
        )
      )
    )
  }

  function updateProjectTaskInState(nextTask: ProjectTask) {
    setProjects((currentProjects) =>
      sortProjectsByUpdatedAt(
        currentProjects.map((project) => {
          if (project.id !== nextTask.projectId) {
            return project
          }

          const nextTasks = project.tasks
            .map((task) => (task.id === nextTask.id ? nextTask : task))
            .sort((leftTask, rightTask) => {
              if (leftTask.order !== rightTask.order) {
                return leftTask.order - rightTask.order
              }

              return new Date(leftTask.createdAt).getTime() - new Date(rightTask.createdAt).getTime()
            })

          return {
            ...project,
            tasks: nextTasks,
            updatedAt: nextTask.updatedAt,
          }
        })
      )
    )
  }

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = projectTitle.trim()

    if (!trimmedTitle || isSaving) {
      return false
    }

    try {
      setIsSaving(true)
      setError("")

      const payload: CreateProjectPayload = {
        title: trimmedTitle,
        description: projectDescription.trim() || undefined,
        status: projectStatus,
      }

      const project = await createProject(payload)

      setProjects((currentProjects) => [project, ...currentProjects])
      setSelectedProjectId(project.id)
      setProjectTitle("")
      setProjectDescription("")
      setProjectStatus(defaultProjectStatus)
      toast.success("Project created")
      return true
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to create project")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedProject || isSaving) {
      return false
    }

    const trimmedTitle = editProjectTitle.trim()

    if (!trimmedTitle) {
      setError("Project title is required")
      return false
    }

    try {
      setIsSaving(true)
      setError("")

      const payload: UpdateProjectPayload = {
        title: trimmedTitle,
        description: editProjectDescription.trim() || undefined,
        status: editProjectStatus,
      }

      const project = await updateProject(selectedProject.id, payload)

      replaceProject(project)
      toast.success("Project saved")
      return true
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save project")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteProject() {
    if (!selectedProject || isSaving) {
      return false
    }

    try {
      setIsSaving(true)
      setError("")

      await deleteProject(selectedProject.id)

      setProjects((currentProjects) =>
        currentProjects.filter((project) => project.id !== selectedProject.id)
      )
      setSelectedProjectId("")
      toast.success("Project deleted")
      return true
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to delete project")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedProject || isSaving) {
      return false
    }

    const trimmedTitle = taskTitle.trim()

    if (!trimmedTitle) {
      setError("Task title is required")
      return false
    }

    try {
      setIsSaving(true)
      setError("")

      const payload: CreateProjectTaskPayload = {
        title: trimmedTitle,
        description: taskDescription.trim() || undefined,
        status: taskStatus,
        accentColor: taskAccentColor,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
      }

      const task = await createProjectTask(selectedProject.id, payload)

      setProjects((currentProjects) =>
        sortProjectsByUpdatedAt(
          currentProjects.map((project) =>
            project.id === selectedProject.id
              ? {
                  ...project,
                  tasks: [...project.tasks, task],
                  updatedAt: task.updatedAt,
                }
              : project
          )
        )
      )

      setTaskTitle("")
      setTaskDescription("")
      setTaskStatus(defaultTaskStatus)
      setTaskAccentColor(defaultTaskAccentColor)
      setTaskDueDate("")
      toast.success("Task added")
      return true
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to add task")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateTask(
    taskId: string,
    payload: UpdateProjectTaskPayload
  ) {
    if (!selectedProject || isSaving) {
      return false
    }

    if (payload.title !== undefined && !payload.title.trim()) {
      setError("Task title is required")
      return false
    }

    try {
      setIsSaving(true)
      setError("")

      const updatedTask = await updateProjectTask(selectedProject.id, taskId, {
        ...payload,
        title: payload.title?.trim(),
        description: payload.description?.trim() || undefined,
      })

      updateProjectTaskInState(updatedTask)
      toast.success("Task saved")
      return true
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save task")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateTaskStatus(task: ProjectTask, status: ProjectTaskStatus) {
    if (!selectedProject || isSaving) {
      return
    }

    if (task.status === status) {
      return
    }

    const previousTask = task
    const nextOrder = selectedProject.tasks.filter(
      (projectTask) => projectTask.id !== task.id && projectTask.status === status
    ).length
    const optimisticTask: ProjectTask = {
      ...task,
      status,
      order: nextOrder,
      updatedAt: new Date().toISOString(),
    }

    try {
      setIsSaving(true)
      setError("")

      updateProjectTaskInState(optimisticTask)

      const updatedTask = await updateProjectTask(selectedProject.id, task.id, {
        status,
      })

      updateProjectTaskInState(updatedTask)
      toast.success("Task updated")
    } catch (error) {
      updateProjectTaskInState(previousTask)
      setError(error instanceof Error ? error.message : "Unable to update task")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!selectedProject || isSaving) {
      return
    }

    try {
      setIsSaving(true)
      setError("")

      await deleteProjectTask(selectedProject.id, taskId)

      setProjects((currentProjects) =>
        sortProjectsByUpdatedAt(
          currentProjects.map((project) =>
            project.id === selectedProject.id
              ? {
                  ...project,
                  tasks: project.tasks.filter((task) => task.id !== taskId),
                  updatedAt: new Date().toISOString(),
                }
              : project
          )
        )
      )
      toast.success("Task deleted")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to delete task")
    } finally {
      setIsSaving(false)
    }
  }

  return {
    projects,
    filteredProjects,
    selectedProject,
    projectCounts,
    error,
    isLoading,
    isSaving,
    searchTerm,
    setSearchTerm,
    projectFilter,
    setProjectFilter,
    projectFilters,
    projectTitle,
    setProjectTitle,
    projectDescription,
    setProjectDescription,
    projectStatus,
    setProjectStatus,
    editProjectTitle,
    setEditProjectTitle,
    editProjectDescription,
    setEditProjectDescription,
    editProjectStatus,
    setEditProjectStatus,
    taskTitle,
    setTaskTitle,
    taskDescription,
    setTaskDescription,
    taskStatus,
    setTaskStatus,
    taskAccentColor,
    setTaskAccentColor,
    taskDueDate,
    setTaskDueDate,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleCreateTask,
    handleUpdateTask,
    handleUpdateTaskStatus,
    handleDeleteTask,
    setSelectedProjectId,
  }
}
