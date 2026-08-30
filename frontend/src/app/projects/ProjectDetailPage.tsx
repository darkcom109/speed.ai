import { useEffect, useMemo, useState } from "react"
import { ArrowLeftIcon, ArrowUpDownIcon, PencilIcon, PlusIcon, SparklesIcon, Trash2Icon } from "lucide-react"
import { useNavigate, useParams } from "react-router"
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import type { DropAnimation } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

import Layout from "@/components/app/Layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { formatTaskDueDateTime } from "@/app/tasks/utils/task-date"
import { createProjectTask, updateProjectTask } from "@/app/projects/api/projects-api"
import { runProjectAi, type ProjectAiMode } from "@/app/projects/api/project-ai-api"
import { useProjects } from "@/app/projects/hooks/use-projects"
import type { ProjectTask, ProjectTaskStatus } from "@/app/projects/types/project"
import { toast } from "@/lib/single-toast"

const taskStatusColumns: Array<{ id: ProjectTaskStatus; label: string }> = [
  { id: "backlog", label: "Backlog" },
  { id: "next", label: "Next" },
  { id: "in_progress", label: "In progress" },
  { id: "done", label: "Done" },
]

const dragDropAnimation: DropAnimation = {
  duration: 220,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
}

const taskAccentPalette = ["#3b82f6", "#a855f7", "#ec4899", "#22c55e", "#f59e0b", "#14b8a6"]

function isHexColor(value: string): value is `#${string}` {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "")
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  return { red, green, blue }
}

function rgbaFromHex(hex: string, alpha: number) {
  const { red, green, blue } = hexToRgb(hex)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function getTaskAccent(task: ProjectTask) {
  const chosenColor = task.accentColor && isHexColor(task.accentColor) ? task.accentColor : null

  if (chosenColor) {
    return {
      color: chosenColor,
      soft: rgbaFromHex(chosenColor, 0.1),
    }
  }

  const seed = `${task.id}-${task.title}`.split("").reduce((accumulator, character) => {
    return (accumulator * 31 + character.charCodeAt(0)) >>> 0
  }, 0)
  const fallbackColor = taskAccentPalette[seed % taskAccentPalette.length]

  return {
    color: fallbackColor,
    soft: rgbaFromHex(fallbackColor, 0.1),
  }
}

function formatDateTimeInputValue(date: string | null) {
  if (!date) {
    return ""
  }

  const nextDate = new Date(date)
  const year = nextDate.getFullYear()
  const month = String(nextDate.getMonth() + 1).padStart(2, "0")
  const day = String(nextDate.getDate()).padStart(2, "0")
  const hours = String(nextDate.getHours()).padStart(2, "0")
  const minutes = String(nextDate.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatProjectDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

function sortTasks(tasks: ProjectTask[]) {
  return [...tasks].sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order
    }

    return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  })
}

function formatProjectBrief(
  brief: {
    summary: string
    goals: string[]
    milestones: string[]
    firstTasks: string[]
  } | undefined,
  message: string
) {
  if (!brief) {
    return message
  }

  const lines = [
    message,
    "",
    brief.summary ? `Summary: ${brief.summary}` : "",
    brief.goals.length > 0 ? `Goals:\n${brief.goals.map((goal) => `- ${goal}`).join("\n")}` : "",
    brief.milestones.length > 0 ? `Milestones:\n${brief.milestones.map((milestone) => `- ${milestone}`).join("\n")}` : "",
    brief.firstTasks.length > 0 ? `First tasks:\n${brief.firstTasks.map((task) => `- ${task}`).join("\n")}` : "",
  ].filter(Boolean)

  return lines.join("\n")
}

type TaskBoardColumnProps = {
  column: { id: ProjectTaskStatus; label: string }
  tasks: ProjectTask[]
  isSaving: boolean
  onDeleteTask: (taskId: string) => void
  onEditTask: (task: ProjectTask) => void
}

function TaskBoardColumn({
  column,
  tasks,
  isSaving,
  onDeleteTask,
  onEditTask,
}: TaskBoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "min-h-[26rem] space-y-3 rounded-lg border border-border/70 bg-card/30 p-3 transition-colors",
        isOver && "border-primary/50 bg-primary/[0.04]"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{column.label}</h3>
        <Badge variant="outline">{tasks.length}</Badge>
      </div>

      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-border/70 px-3 py-4 text-sm text-muted-foreground">
            No tasks here.
          </div>
        ) : (
          tasks.map((task) => (
          <DraggableTaskCard
              key={task.id}
              task={task}
              isSaving={isSaving}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
            />
          ))
        )}
      </div>
    </section>
  )
}

type DraggableTaskCardProps = {
  task: ProjectTask
  isSaving: boolean
  onDeleteTask: (taskId: string) => void
  onEditTask: (task: ProjectTask) => void
}

function DraggableTaskCard({
  task,
  isSaving,
  onDeleteTask,
  onEditTask,
}: DraggableTaskCardProps) {
  const accent = getTaskAccent(task)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useDraggable({
    id: task.id,
    data: {
      task,
    },
  })

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        borderLeftColor: accent.color,
      }}
      data-dragging={isDragging}
      className={cn(
        "cursor-grab space-y-3 rounded-lg border border-l-[3px] bg-background p-3 shadow-sm transition-[border-color,box-shadow,opacity] hover:border-border hover:shadow-md active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: accent.color }}
              aria-hidden="true"
            />
            <p className="text-sm font-medium">{task.title}</p>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {task.description || "No description."}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={(event) => {
              event.stopPropagation()
              onEditTask(task)
            }}
            disabled={isSaving}
            aria-label={`Edit ${task.title}`}
          >
            <PencilIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={(event) => {
              event.stopPropagation()
              onDeleteTask(task.id)
            }}
            disabled={isSaving}
            aria-label={`Delete ${task.title}`}
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {task.dueDate && (
          <p className="text-xs text-muted-foreground">Due {formatTaskDueDateTime(task.dueDate)}</p>
        )}
      </div>
    </article>
  )
}

export default function ProjectDetailPage() {
  const navigate = useNavigate()
  const params = useParams()
  const projectId = params.projectId || ""

  const [editProjectOpen, setEditProjectOpen] = useState(false)
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [editTaskOpen, setEditTaskOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResult, setAiResult] = useState("")
  const [isAiRunning, setIsAiRunning] = useState(false)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null)
  const [editTaskTitle, setEditTaskTitle] = useState("")
  const [editTaskDescription, setEditTaskDescription] = useState("")
  const [editTaskStatus, setEditTaskStatus] = useState<ProjectTaskStatus>("backlog")
  const [editTaskAccentColor, setEditTaskAccentColor] = useState("#3b82f6")
  const [editTaskDueDate, setEditTaskDueDate] = useState("")

  const {
    selectedProject,
    error,
    isLoading,
    isSaving,
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
    handleUpdateProject,
    handleDeleteProject,
    handleCreateTask,
    handleUpdateTask,
    handleUpdateTaskStatus,
    handleDeleteTask,
    refreshProjects,
  } = useProjects({
    initialSelectedProjectId: projectId,
  })

  const groupedTasks = useMemo(() => {
    if (!selectedProject) {
      return taskStatusColumns.map((column) => ({
        ...column,
        tasks: [] as ProjectTask[],
      }))
    }

    return taskStatusColumns.map((column) => ({
      ...column,
      tasks: sortTasks(
        selectedProject.tasks.filter((task) => task.status === column.id)
      ),
    }))
  }, [selectedProject])

  const activeTask = useMemo(() => {
    if (!selectedProject || !activeTaskId) {
      return null
    }

    return selectedProject.tasks.find((task) => task.id === activeTaskId) || null
  }, [activeTaskId, selectedProject])

  useEffect(() => {
    if (!editTaskOpen || !editingTask) {
      return
    }

    setEditTaskTitle(editingTask.title)
    setEditTaskDescription(editingTask.description || "")
    setEditTaskStatus(editingTask.status)
    setEditTaskAccentColor(
      editingTask.accentColor && isHexColor(editingTask.accentColor)
        ? editingTask.accentColor
        : getTaskAccent(editingTask).color
    )
    setEditTaskDueDate(formatDateTimeInputValue(editingTask.dueDate))
  }, [editTaskOpen, editingTask?.id])

  useEffect(() => {
    if (editTaskOpen) {
      return
    }

    setEditingTask(null)
    setEditTaskTitle("")
    setEditTaskDescription("")
    setEditTaskStatus("backlog")
    setEditTaskAccentColor("#3b82f6")
    setEditTaskDueDate("")
  }, [editTaskOpen])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 8,
      },
    })
  )

  async function handleProjectAi(mode: ProjectAiMode) {
    if (!selectedProject || isAiRunning) {
      return
    }

    try {
      setIsAiRunning(true)
      setAiResult("")

      const response = await runProjectAi(selectedProject.id, {
        mode,
        prompt: aiPrompt.trim() || undefined,
      })

      if (response.type === "brief") {
        setAiResult(formatProjectBrief(response.brief, response.message))
        toast.info("Project brief ready")
        return
      }

      if (response.type === "help") {
        setAiResult(response.message)
        toast.info("AI advice ready")
        return
      }

      if (mode === "generate_tasks") {
        let createdCount = 0

        for (const suggestion of response.tasks) {
          await createProjectTask(selectedProject.id, {
            title: suggestion.title,
            description: suggestion.description || undefined,
            status: suggestion.status,
            accentColor: suggestion.accentColor,
            dueDate: suggestion.dueDate || undefined,
          })
          createdCount += 1
        }

        if (createdCount > 0) {
          await refreshProjects()
        }

        setAiResult(response.message || `Added ${createdCount} task${createdCount === 1 ? "" : "s"}.`)
        toast.success(createdCount > 0 ? `Added ${createdCount} task${createdCount === 1 ? "" : "s"}` : "No tasks generated")
        return
      }

      if (mode === "rebalance_board") {
        let movedCount = 0

        for (const move of response.moves) {
          await updateProjectTask(selectedProject.id, move.taskId, {
            status: move.status,
          })
          movedCount += 1
        }

        if (movedCount > 0) {
          await refreshProjects()
        }

        setAiResult(response.message || `Moved ${movedCount} task${movedCount === 1 ? "" : "s"}.`)
        toast.success(movedCount > 0 ? `Moved ${movedCount} task${movedCount === 1 ? "" : "s"}` : "No task moves suggested")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI project tool failed"
      setAiResult(message)
      toast.error(message)
    } finally {
      setIsAiRunning(false)
    }
  }

  if (!isLoading && !selectedProject) {
    return (
      <Layout>
        <div className="space-y-6">
          <header>
            <h2 className="text-xl font-semibold tracking-tight">Project</h2>
            <p className="text-sm text-muted-foreground">
              We could not find that project.
            </p>
          </header>

          <Card className="border shadow-sm">
            <CardContent className="flex min-h-[16rem] items-center justify-center p-6 text-center">
              <div className="max-w-sm space-y-4">
                <p className="text-sm text-muted-foreground">
                  The project may have been deleted or you may not have access to it.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/projects")}
                >
                  <ArrowLeftIcon />
                  Back to projects
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">
              {selectedProject?.title || "Project"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedProject?.description || "Plan work, keep tasks moving, and track delivery."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/projects")}>
              <ArrowLeftIcon />
              Back to projects
            </Button>
          </div>
        </header>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {isLoading && <p className="text-sm text-muted-foreground">Loading project...</p>}

        {selectedProject && (
          <>
            <section className="overflow-hidden rounded-lg border border-border/70 bg-card/20">
              <div className="space-y-4 px-5 py-4 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="mt-0.5 text-sm font-medium">
                        {formatProjectDate(selectedProject.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last updated</p>
                      <p className="mt-0.5 text-sm font-medium">
                        {formatProjectDate(selectedProject.updatedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tasks</p>
                      <p className="mt-0.5 text-sm font-medium">{selectedProject.tasks.length}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <PlusIcon />
                          Add task
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader className="pr-8">
                          <DialogTitle className="text-lg leading-6">Add task</DialogTitle>
                          <DialogDescription>
                            Create a task and place it into the right part of the board.
                          </DialogDescription>
                        </DialogHeader>

                        <form
                          className="grid gap-3"
                          onSubmit={async (event) => {
                            const created = await handleCreateTask(event)

                            if (created) {
                              setAddTaskOpen(false)
                            }
                          }}
                        >
                          <Input
                            id="task-title"
                            value={taskTitle}
                            onChange={(event) => setTaskTitle(event.target.value)}
                            placeholder="Task title"
                            aria-label="Task title"
                            disabled={isSaving}
                          />

                          <Textarea
                            id="task-description"
                            value={taskDescription}
                            onChange={(event) => setTaskDescription(event.target.value)}
                            placeholder="Description"
                            aria-label="Task description"
                            className="min-h-32 resize-y"
                            disabled={isSaving}
                          />

                          <Select
                            value={taskStatus}
                            onValueChange={(value) => setTaskStatus(value as typeof taskStatus)}
                            disabled={isSaving}
                          >
                            <SelectTrigger id="task-status" className="w-full" aria-label="Task status">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {taskStatusColumns.map((status) => (
                                <SelectItem key={status.id} value={status.id}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium">Colour</p>
                              <Input
                                type="color"
                                value={taskAccentColor}
                                onChange={(event) => setTaskAccentColor(event.target.value)}
                                aria-label="Task colour"
                                className="h-8 w-14 cursor-pointer rounded-md border-border bg-transparent p-1"
                                disabled={isSaving}
                              />
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {taskAccentPalette.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => setTaskAccentColor(color)}
                                  disabled={isSaving}
                                  aria-label={`Choose ${color}`}
                                  className={cn(
                                    "size-8 rounded-full border transition-transform",
                                    taskAccentColor === color
                                      ? "scale-110 border-foreground shadow-md"
                                      : "border-border hover:scale-105"
                                  )}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>

                          <Input
                            id="task-due-date"
                            type="datetime-local"
                            value={taskDueDate}
                            onChange={(event) => setTaskDueDate(event.target.value)}
                            aria-label="Due date and time"
                            disabled={isSaving}
                          />

                          <div className="flex justify-end gap-2 border-t pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setAddTaskOpen(false)}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving || !taskTitle.trim()}>
                              Add task
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

                    {editingTask && (
                      <Dialog open={editTaskOpen} onOpenChange={setEditTaskOpen}>
                        <DialogContent className="max-w-md">
                          <DialogHeader className="pr-8">
                            <DialogTitle className="text-lg leading-6">Edit task</DialogTitle>
                            <DialogDescription>
                              Update the task details, colour, and due date.
                            </DialogDescription>
                          </DialogHeader>

                          <form
                            className="grid gap-3"
                            onSubmit={async (event) => {
                              event.preventDefault()

                              if (!editingTask) {
                                return
                              }

                              const saved = await handleUpdateTask(editingTask.id, {
                                title: editTaskTitle,
                                description: editTaskDescription,
                                status: editTaskStatus,
                                accentColor: editTaskAccentColor,
                                dueDate: editTaskDueDate ? new Date(editTaskDueDate).toISOString() : null,
                              })

                              if (saved) {
                                setEditTaskOpen(false)
                              }
                            }}
                          >
                            <Input
                              id="edit-task-title"
                              value={editTaskTitle}
                              onChange={(event) => setEditTaskTitle(event.target.value)}
                              placeholder="Task title"
                              aria-label="Task title"
                              disabled={isSaving}
                            />

                            <Textarea
                              id="edit-task-description"
                              value={editTaskDescription}
                              onChange={(event) => setEditTaskDescription(event.target.value)}
                              placeholder="Description"
                              aria-label="Task description"
                              className="min-h-32 resize-y"
                              disabled={isSaving}
                            />

                            <Select
                              value={editTaskStatus}
                              onValueChange={(value) => setEditTaskStatus(value as ProjectTaskStatus)}
                              disabled={isSaving}
                            >
                              <SelectTrigger id="edit-task-status" className="w-full" aria-label="Task status">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {taskStatusColumns.map((status) => (
                                  <SelectItem key={status.id} value={status.id}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-medium">Colour</p>
                                <Input
                                  type="color"
                                  value={editTaskAccentColor}
                                  onChange={(event) => setEditTaskAccentColor(event.target.value)}
                                  aria-label="Task colour"
                                  className="h-8 w-14 cursor-pointer rounded-md border-border bg-transparent p-1"
                                  disabled={isSaving}
                                />
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {taskAccentPalette.map((color) => (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => setEditTaskAccentColor(color)}
                                    disabled={isSaving}
                                    aria-label={`Choose ${color}`}
                                    className={cn(
                                      "size-8 rounded-full border transition-transform",
                                      editTaskAccentColor === color
                                        ? "scale-110 border-foreground shadow-md"
                                        : "border-border hover:scale-105"
                                    )}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>

                            <Input
                              id="edit-task-due-date"
                              type="datetime-local"
                              value={editTaskDueDate}
                              onChange={(event) => setEditTaskDueDate(event.target.value)}
                              aria-label="Due date and time"
                              disabled={isSaving}
                            />

                            <div className="flex justify-end gap-2 border-t pt-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditTaskOpen(false)}
                                disabled={isSaving}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={isSaving || !editTaskTitle.trim()}>
                                Save task
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}

                    <Dialog open={editProjectOpen} onOpenChange={setEditProjectOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <PencilIcon />
                          Edit project
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader className="pr-8">
                          <DialogTitle className="text-lg leading-6">Edit project</DialogTitle>
                          <DialogDescription>
                            Update the project title, description, and status.
                          </DialogDescription>
                        </DialogHeader>

                        <form
                          className="grid gap-3"
                          onSubmit={async (event) => {
                            const saved = await handleUpdateProject(event)

                            if (saved) {
                              setEditProjectOpen(false)
                            }
                          }}
                        >
                          <Input
                            id="edit-project-title"
                            value={editProjectTitle}
                            onChange={(event) => setEditProjectTitle(event.target.value)}
                            placeholder="Project title"
                            aria-label="Project title"
                            disabled={isSaving}
                          />

                          <Textarea
                            id="edit-project-description"
                            value={editProjectDescription}
                            onChange={(event) => setEditProjectDescription(event.target.value)}
                            placeholder="Description"
                            aria-label="Project description"
                            className="min-h-32 resize-y"
                            disabled={isSaving}
                          />

                          <Select
                            value={editProjectStatus}
                            onValueChange={(value) => setEditProjectStatus(value as typeof editProjectStatus)}
                            disabled={isSaving}
                          >
                            <SelectTrigger id="edit-project-status" className="w-full" aria-label="Project status">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                          </Select>

                          <div className="flex justify-end gap-2 border-t pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditProjectOpen(false)}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving || !editProjectTitle.trim()}>
                              Save project
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        const deleted = await handleDeleteProject()

                        if (deleted) {
                          navigate("/projects")
                        }
                      }}
                      disabled={isSaving}
                      aria-label="Delete project"
                    >
                      <Trash2Icon />
                      Delete project
                    </Button>
                  </div>
                </div>

              </div>

              <div className="border-t border-border/60 px-5 py-4 sm:px-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="size-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Project assistant</p>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-border/70 bg-background shadow-sm focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30">
                    <Textarea
                      value={aiPrompt}
                      onChange={(event) => setAiPrompt(event.target.value)}
                      placeholder="Tell AI what you want it to do with this project..."
                      aria-label="Project AI prompt"
                      className="min-h-24 resize-y rounded-none border-0 bg-transparent px-4 py-3 shadow-none focus-visible:ring-0"
                      disabled={isAiRunning}
                    />

                    <div className="flex flex-col gap-2 border-t border-border/60 bg-muted/10 p-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleProjectAi("generate_tasks")}
                          disabled={isAiRunning}
                        >
                          <PlusIcon />
                          Generate tasks
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleProjectAi("rebalance_board")}
                          disabled={isAiRunning}
                        >
                          <ArrowUpDownIcon />
                          Rebalance
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleProjectAi("brief")}
                          disabled={isAiRunning}
                        >
                          <SparklesIcon />
                          Brief
                        </Button>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => void handleProjectAi("help")}
                        disabled={isAiRunning}
                      >
                        <SparklesIcon />
                        {isAiRunning ? "Working..." : "Ask AI"}
                      </Button>
                    </div>
                  </div>

                  {(isAiRunning || aiResult) && (
                    <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm whitespace-pre-line text-muted-foreground">
                      {isAiRunning ? "Working on your project..." : aiResult}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">Board</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedProject.tasks.length} {selectedProject.tasks.length === 1 ? "task" : "tasks"} across four stages
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={(event: DragStartEvent) => {
                    if (selectedProject?.tasks.some((task) => task.id === String(event.active.id))) {
                      setActiveTaskId(String(event.active.id))
                    }
                  }}
                  onDragEnd={async (event: DragEndEvent) => {
                    const taskId = String(event.active.id)
                    const overId = event.over?.id

                    if (!selectedProject || !overId || typeof overId !== "string") {
                      setActiveTaskId(null)
                      return
                    }

                    if (!taskStatusColumns.some((column) => column.id === overId)) {
                      setActiveTaskId(null)
                      return
                    }

                    const task = selectedProject.tasks.find((item) => item.id === taskId)

                    if (!task || task.status === overId) {
                      setActiveTaskId(null)
                      return
                    }

                    void handleUpdateTaskStatus(task, overId as ProjectTaskStatus)
                    setActiveTaskId(null)
                  }}
                  onDragCancel={() => setActiveTaskId(null)}
                >
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {groupedTasks.map((column) => (
                      <TaskBoardColumn
                        key={column.id}
                        column={column}
                        tasks={column.tasks}
                        isSaving={isSaving}
                        onDeleteTask={handleDeleteTask}
                        onEditTask={(task) => {
                          setEditingTask(task)
                          setEditTaskOpen(true)
                        }}
                      />
                    ))}
                  </div>

                  <DragOverlay dropAnimation={dragDropAnimation}>
                    {activeTask ? (
                      <article
                        className="w-[18rem] space-y-3 rounded-lg border border-border/70 bg-background p-3 shadow-xl"
                        style={{
                          borderLeftColor: getTaskAccent(activeTask).color,
                          borderLeftWidth: 3,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: getTaskAccent(activeTask).color }}
                                aria-hidden="true"
                              />
                              <p className="text-sm font-medium">{activeTask.title}</p>
                            </div>
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {activeTask.description || "No description."}
                            </p>
                          </div>
                          <Button type="button" variant="ghost" size="icon-xs" tabIndex={-1}>
                            <Trash2Icon />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {activeTask.dueDate && (
                            <p className="text-xs text-muted-foreground">
                              Due {formatTaskDueDateTime(activeTask.dueDate)}
                            </p>
                          )}
                        </div>
                      </article>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  )
}
