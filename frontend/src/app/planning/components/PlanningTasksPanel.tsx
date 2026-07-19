import { useState } from "react"
import {
  CalendarClockIcon,
  CheckCircle2Icon,
  CircleIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react"

import {
  DeleteTaskDialog,
  EditTaskDialog,
  TaskFormDialog,
  TaskPreviewDialog,
} from "@/app/tasks/components"
import { useTasks } from "@/app/tasks/hooks/use-tasks"
import useTasksToolbar from "@/app/tasks/hooks/use-tasks-toolbar"
import type { Task, TaskFilter } from "@/app/tasks/types"
import { formatTaskDueDateTime } from "@/app/tasks/utils/task-date"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type PlanningTasksPanelProps = {
  model: ReturnType<typeof useTasks>
}

export default function PlanningTasksPanel({ model }: PlanningTasksPanelProps) {
  const [previewTask, setPreviewTask] = useState<Task | null>(null)
  const {
    isCreateOpen,
    setIsCreateOpen,
    handleSubmitCreateTask,
    handleCancelCreateTask,
  } = useTasksToolbar({
    handleCreateTask: model.handleCreateTask,
    handleDeleteAllTasks: model.handleDeleteAllTasks,
  })
  const visibleTasks = [...model.activeTasks, ...model.completedTasks]

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card xl:h-full">
      <div className="flex min-h-16 items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Tasks</h2>
          <p className="text-xs text-muted-foreground">
            {model.activeTasks.length} active
          </p>
        </div>

        <TaskFormDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          trigger={
            <Button type="button" size="sm">
              <PlusIcon />
              Add task
            </Button>
          }
          title="Add task"
          description="Create a task and place it on your calendar."
          submitLabel="Add task"
          taskTitle={model.title}
          taskDescription={model.description}
          taskDueDate={model.dueDate}
          setTaskTitle={model.setTitle}
          setTaskDescription={model.setDescription}
          setTaskDueDate={model.setDueDate}
          onSubmit={handleSubmitCreateTask}
          onCancel={handleCancelCreateTask}
        />
      </div>

      <div className="flex items-center gap-2 border-b p-3">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={model.searchTerm}
            onChange={(event) => model.setSearchTerm(event.target.value)}
            placeholder="Search tasks"
            aria-label="Search tasks"
            className="pl-8"
          />
        </div>

        <Select
          value={model.taskFilter}
          onValueChange={(value) => model.setTaskFilter(value as TaskFilter)}
        >
          <SelectTrigger className="w-32 shrink-0" aria-label="Filter tasks">
            <SelectValue placeholder="Filter tasks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tasks</SelectItem>
            <SelectItem value="due-today">Due today</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="next-7-days">Next 7 days</SelectItem>
            <SelectItem value="no-date">No due date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {model.isLoading && (
          <p className="p-4 text-sm text-muted-foreground">Loading tasks...</p>
        )}

        {model.error && (
          <p className="p-4 text-sm text-destructive">{model.error}</p>
        )}

        {!model.isLoading && !model.error && visibleTasks.length === 0 && (
          <div className="grid min-h-40 place-items-center p-6 text-center">
            <div>
              <p className="text-sm font-medium">No matching tasks</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add a task or adjust your filters.
              </p>
            </div>
          </div>
        )}

        <ul className="divide-y">
          {visibleTasks.map((task) => {
            const StatusIcon = task.completed ? CheckCircle2Icon : CircleIcon

            return (
              <li key={task.id} className="group px-3 py-3 hover:bg-muted/20">
                <div className="flex items-start gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => void model.handleToggleTask(task)}
                    aria-label={
                      task.completed
                        ? `Mark ${task.title} undone`
                        : `Mark ${task.title} done`
                    }
                    className="mt-0.5 shrink-0 text-muted-foreground"
                  >
                    <StatusIcon
                      className={task.completed ? "text-emerald-500" : ""}
                    />
                  </Button>

                  <button
                    type="button"
                    onClick={() => setPreviewTask(task)}
                    className="min-w-0 flex-1 cursor-pointer py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      className={
                        task.completed
                          ? "block truncate text-sm font-medium text-muted-foreground line-through"
                          : "block truncate text-sm font-medium"
                      }
                    >
                      {task.title}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarClockIcon className="size-3.5 shrink-0" />
                      <span className="truncate">
                        {task.dueDate
                          ? formatTaskDueDateTime(task.dueDate)
                          : "No due date"}
                      </span>
                    </span>
                  </button>

                  <div className="flex shrink-0 items-center opacity-70 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                    <EditTaskDialog
                      task={task}
                      isOpen={model.editingTaskId === task.id}
                      onOpenChange={(open) => {
                        if (open) {
                          model.startEditingTask(task)
                          return
                        }

                        model.setEditingTaskId(null)
                      }}
                      handleUpdateTask={model.handleUpdateTask}
                      editTitle={model.editTitle}
                      editDescription={model.editDescription}
                      editDueDate={model.editDueDate}
                      setEditTitle={model.setEditTitle}
                      setEditDescription={model.setEditDescription}
                      setEditDueDate={model.setEditDueDate}
                      setEditingTaskId={model.setEditingTaskId}
                    />
                    <DeleteTaskDialog
                      taskTitle={task.title}
                      onDelete={() => model.handleDeleteTask(task.id)}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <TaskPreviewDialog
        task={previewTask}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewTask(null)
          }
        }}
      />
    </aside>
  )
}
