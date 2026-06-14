import Layout from "@/components/app/Layout"
import { useTasks } from "@/app/tasks/hooks/use-tasks"
import {
  TasksHeader,
  TasksToolbar,
  TaskOverviewStats,
  TaskSection,
  RenderTask,
} from "@/app/tasks/components"
import type { Task } from "@/app/tasks/types"

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
    searchTerm,
    activePage,
    completedPage,
    taskFilter,
    activeTasks,
    completedTasks,
    paginatedActiveTasks,
    paginatedCompletedTasks,
    activePageCount,
    completedPageCount,
    tasksPerPage,
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
    handleDeleteAllTasks,
    setSearchTerm,
    setActivePage,
    setCompletedPage,
    setTaskFilter,
  } = useTasks()

  function renderTask(task: Task) {
    return (
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
    )
  }

  return (
    <Layout>
      <TasksHeader />

      <TaskOverviewStats tasks={tasks} isLoading={isLoading} />

      <TasksToolbar
        handleCreateTask={handleCreateTask}
        handleDeleteAllTasks={handleDeleteAllTasks}
        title={title}
        description={description}
        dueDate={dueDate}
        setTitle={setTitle}
        setDescription={setDescription}
        setDueDate={setDueDate}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        taskFilter={taskFilter}
        setTaskFilter={setTaskFilter}
      />

      {isLoading && <p>Loading tasks...</p>}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <TaskSection
        activeTasks={activeTasks}
        completedTasks={completedTasks}
        paginatedActiveTasks={paginatedActiveTasks}
        paginatedCompletedTasks={paginatedCompletedTasks}
        activePage={activePage}
        completedPage={completedPage}
        activePageCount={activePageCount}
        completedPageCount={completedPageCount}
        tasksPerPage={tasksPerPage}
        onActivePageChange={setActivePage}
        onCompletedPageChange={setCompletedPage}
        renderTask={renderTask}
      />
    </Layout>
  )
}
