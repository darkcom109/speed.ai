import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useTasks } from "@/app/tasks/hooks/use-tasks"

// Component related imports
import CreateTask from "@/app/tasks/components/CreateTask"
import TasksHeader from "@/app/tasks/components/TasksHeader"
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
  } = useTasks()

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
