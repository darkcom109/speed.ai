import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import Layout from "@/components/app/Layout"
import { useTasks } from "@/app/tasks/hooks/use-tasks"
import {
  TasksHeader,
  TasksToolbar,
  TaskOverviewStats,
  RenderTask,
} from "@/app/tasks/components/"
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

  function renderPagination(
    currentPage: number,
    pageCount: number,
    totalTasks: number,
    onPageChange: (page: number) => void
  ) {
    if (totalTasks <= tasksPerPage) {
      return null
    }

    const firstVisibleTask = (currentPage - 1) * tasksPerPage + 1
    const lastVisibleTask = Math.min(currentPage * tasksPerPage, totalTasks)

    return (
      <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {firstVisibleTask}-{lastVisibleTask} of {totalTasks}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {pageCount}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === pageCount}
          >
            Next
          </Button>
        </div>
      </div>
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
          {renderTaskList(paginatedActiveTasks, "No current tasks found.")}
          {renderPagination(
            activePage,
            activePageCount,
            activeTasks.length,
            setActivePage
          )}
        </TabsContent>

        <TabsContent value="marked" className="space-y-3">
          <div>
            <h3 className="text-sm font-medium">Marked tasks</h3>
            <p className="text-xs text-muted-foreground">
              Tasks you have marked as done.
            </p>
          </div>
          {renderTaskList(paginatedCompletedTasks, "No marked tasks found.")}
          {renderPagination(
            completedPage,
            completedPageCount,
            completedTasks.length,
            setCompletedPage
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  )
}
