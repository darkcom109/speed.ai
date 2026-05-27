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

import { createTask } from "@/app/tasks/api/tasks-api.ts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

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
              <li key={task.id} className="p-3">
                <p className="font-medium">{task.title}</p>
                {task.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {task.description}
                  </p>
                )}
              </li>
            ))}
          </ul>

        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
