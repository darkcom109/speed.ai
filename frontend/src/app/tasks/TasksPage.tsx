import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { getTasks } from "@/app/tasks/api/tasks-api.ts"
import type { Task } from "@/app/tasks/types/task.ts"

import { createTask, updateTask, deleteTask } from "@/app/tasks/api/tasks-api.ts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch("http://localhost:3001/api/auth/me", {
        credentials: "include",
      })

      if (!response.ok) {
        navigate("/login")
      }

      try {
        const tasks = await getTasks()
        setTasks(tasks)
      }
      catch(error) {
        setError(error instanceof Error ? error.message : "Unable to retrieve tasks")
        console.log(error)
      }
      finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [navigate])

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setError("")

      const task = await createTask({
        title,
        description: description || undefined,
      })

      setTasks((currentTasks) => [task, ...currentTasks])
      setTitle("")
      setDescription("")
    }
    catch(error) {
      setError(error instanceof Error ? error.message : "Unable to create task")
    }
  }

  async function handleToggleTask(task: Task) {
    try {
      setError("")

      const updatedTask = await updateTask(task.id, {
        completed: !task.completed
      })

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updatedTask.id ? updatedTask : currentTask
        )
      )
    }
    catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update task")
    }
  }

  function startEditingTask(task: Task) {
    setEditingTaskId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description || "")
  }

  async function handleUpdateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingTaskId) {
      return
    }

    try {
      setError("")

      const updatedTask = await updateTask(editingTaskId, {
        title: editTitle,
        description: editDescription || undefined
      })

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      )

      setEditingTaskId(null)
      setEditTitle("")
      setEditDescription("")
    } 
    catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update task")
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      setError("")

      await deleteTask(taskId)

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      )
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to delete task")
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Tasks" />
        
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Tasks</h2>
            <p className="text-sm text-muted-foreground">
              A basic task tracker will live here.
            </p>
          </div>

          <form
            onSubmit={handleCreateTask}
            className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row"
          >
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Task title"
              required
            />
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
            />
            <Button type="submit" className="sm:w-28">
              Add task
            </Button>
          </form>

          {isLoading && <p>Loading tasks...</p>}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <ul className="divide-y rounded-lg border bg-card">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-start justify-between gap-3 p-3">
                {editingTaskId === task.id ? (
                  <form onSubmit={handleUpdateTask} className="flex flex-1 flex-col gap-2">
                    <Input
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      required
                    />
                    <Input
                      value={editDescription}
                      onChange={(event) => setEditDescription(event.target.value)}
                      placeholder="Description"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingTaskId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <p
                        className={
                          task.completed
                            ? "font-medium text-muted-foreground line-through"
                            : "font-medium"
                        }
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startEditingTask(task)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleTask(task)}
                      >
                        {task.completed ? "Mark Undone" : "Mark done"}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>

        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
