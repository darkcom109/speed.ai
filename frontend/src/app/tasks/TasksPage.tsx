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

// Component related imports
import CreateTask from "@/app/tasks/components/CreateTask"
import TasksHeader from "@/app/tasks/components/TasksHeader"
import RenderTask from "./components/RenderTask"
import UpdateTask from "./components/UpdateTask"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDueDate, setEditDueDate] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")

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
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      })

      setTasks((currentTasks) => [task, ...currentTasks])
      setTitle("")
      setDescription("")
      setDueDate("")
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
    setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "")
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
        description: editDescription || undefined,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined,
      })

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      )

      setEditingTaskId(null)
      setEditTitle("")
      setEditDescription("")
      setEditDueDate("")
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
          <TasksHeader />

          <CreateTask
            handleCreateTask={handleCreateTask}
            title={title}
            description={description}
            dueDate={dueDate}
            setTitle={setTitle}
            setDescription={setDescription}
            setDueDate={setDueDate}
          />

          {isLoading && <p>Loading tasks...</p>}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <ul className="divide-y rounded-lg border bg-card">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-start justify-between gap-3 p-3">
                {editingTaskId === task.id ? (
                  <UpdateTask 
                    handleUpdateTask={handleUpdateTask}
                    editTitle={editTitle}
                    editDescription={editDescription}
                    editDueDate={editDueDate}
                    setEditTitle={setEditTitle}
                    setEditDescription={setEditDescription}
                    setEditDueDate={setEditDueDate}
                    setEditingTaskId={setEditingTaskId}
                  />
                ) : (
                  <>
                    <RenderTask 
                      task={task}
                      startEditingTask={startEditingTask}
                      handleToggleTask={handleToggleTask}
                      handleDeleteTask={handleDeleteTask}
                    />
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
