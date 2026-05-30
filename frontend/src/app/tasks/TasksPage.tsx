import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTasks } from "@/app/tasks/hooks/use-tasks"

import TasksHeader from "@/app/tasks/components/TasksHeader"
import TasksToolbar from "@/app/tasks/components/TasksToolbar"
import RenderTask from "./components/RenderTask"
import type { Task } from "@/app/tasks/types/task"

export default function TasksPage() {
  const {
    tasks,
    error,
    isLoading,
    editingTaskId,
    editTitle,
    editDescription,
    editDueDate,
    title,
    description,
    dueDate,
    setTitle,
    setDescription,
    setDueDate,
    setEditTitle,
    setEditDescription,
    setEditDueDate,
    setEditingTaskId,
    handleCreateTask,
    handleToggleTask,
    startEditingTask,
    handleUpdateTask,
    handleDeleteTask,
    searchTerm,
    setSearchTerm,
  } = useTasks()

  const filteredTasks = tasks.filter((task) => {
    const search = searchTerm.toLowerCase()

    return (
      task.title.toLowerCase().includes(search) ||
      task.description?.toLowerCase().includes(search)
    )
  })
  const activeTasks = filteredTasks.filter((task) => !task.completed)
  const completedTasks = filteredTasks.filter((task) => task.completed)

  function renderTaskList(tasks: Task[], emptyMessage: string) {
    if (tasks.length === 0) {
      return (
        <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )
    }

    return (
      <ul className="divide-y rounded-lg border bg-card">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-start justify-between gap-3 p-3"
          >
            <RenderTask
              task={task}
              isEditing={editingTaskId === task.id}
              startEditingTask={startEditingTask}
              handleToggleTask={handleToggleTask}
              handleDeleteTask={handleDeleteTask}
              handleUpdateTask={handleUpdateTask}
              editTitle={editTitle}
              editDescription={editDescription}
              editDueDate={editDueDate}
              setEditTitle={setEditTitle}
              setEditDescription={setEditDescription}
              setEditDueDate={setEditDueDate}
              setEditingTaskId={setEditingTaskId}
            />
          </li>
        ))}
      </ul>
    )
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

          <TasksToolbar
            handleCreateTask={handleCreateTask}
            title={title}
            description={description}
            dueDate={dueDate}
            setTitle={setTitle}
            setDescription={setDescription}
            setDueDate={setDueDate}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {isLoading && <p>Loading tasks...</p>}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Tabs defaultValue="current" className="gap-4">
            <TabsList className="h-10 w-full justify-start rounded-lg bg-card p-1 sm:w-fit">
              <TabsTrigger value="current">
                Current ({activeTasks.length})
              </TabsTrigger>
              <TabsTrigger value="marked">
                Marked ({completedTasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-3">
              <div>
                <h3 className="text-sm font-medium">Current tasks</h3>
                <p className="text-xs text-muted-foreground">
                  Tasks that still need attention.
                </p>
              </div>
              {renderTaskList(activeTasks, "No current tasks found.")}
            </TabsContent>

            <TabsContent value="marked" className="space-y-3">
              <div>
                <h3 className="text-sm font-medium">Marked tasks</h3>
                <p className="text-xs text-muted-foreground">
                  Tasks you have marked as done.
                </p>
              </div>
              {renderTaskList(completedTasks, "No marked tasks found.")}
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
