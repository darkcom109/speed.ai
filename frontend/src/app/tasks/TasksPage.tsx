import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useTasks } from "@/app/tasks/hooks/use-tasks"

import TasksHeader from "@/app/tasks/components/TasksHeader"
import TasksToolbar from "@/app/tasks/components/TasksToolbar"
import RenderTask from "./components/RenderTask"

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

          <ul className="divide-y rounded-lg border bg-card">
            {filteredTasks.map((task) => (
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
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
