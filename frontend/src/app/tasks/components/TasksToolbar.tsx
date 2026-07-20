import { Trash2 } from "lucide-react"

import TaskFormDialog from "@/app/tasks/components/TaskFormDialog"
import type { TaskFilter } from "@/app/tasks/types/index"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DeleteAllTasksDialog from "@/app/tasks/components/DeleteAllTasksDialog"
import useTasksToolbar from "@/app/tasks/hooks/use-tasks-toolbar"

type TasksToolbarProps = {
  handleCreateTask: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  handleDeleteAllTasks: () => Promise<void>
  title: string
  description: string
  dueDate: string
  setTitle: React.Dispatch<React.SetStateAction<string>>
  setDescription: React.Dispatch<React.SetStateAction<string>>
  setDueDate: React.Dispatch<React.SetStateAction<string>>
  searchTerm: string
  setSearchTerm: (value: string) => void
  taskFilter: TaskFilter
  setTaskFilter: (value: TaskFilter) => void
}

export default function TasksToolbar({
  handleCreateTask,
  handleDeleteAllTasks,
  title,
  description,
  dueDate,
  setTitle,
  setDescription,
  setDueDate,
  searchTerm,
  setSearchTerm,
  taskFilter,
  setTaskFilter,
}: TasksToolbarProps) {
  const {
    isCreateOpen,
    isDeleteAllOpen,
    handleSubmitCreateTask,
    handleConfirmDeleteAllTasks,
    handleCancelCreateTask,
    setIsCreateOpen,
    setIsDeleteAllOpen,
  } = useTasksToolbar({ handleCreateTask, handleDeleteAllTasks })

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 lg:flex-row">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row">
        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search tasks..."
          className="flex-1"
        />

        <Select
          value={taskFilter}
          onValueChange={(value) => setTaskFilter(value as TaskFilter)}
        >
          <SelectTrigger className="h-12 w-full sm:w-40">
            <SelectValue placeholder="Filter tasks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tasks</SelectItem>
            <SelectItem value="due-today">Due today</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="next-7-days">Next 7 days</SelectItem>
            <SelectItem value="no-date">No due date</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <TaskFormDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          trigger={
            <Button type="button" className="flex-1 sm:w-28 sm:flex-none">
              Add task
            </Button>
          }
          title="Add task"
          description="Create a new task."
          submitLabel="Add task"
          taskTitle={title}
          taskDescription={description}
          taskDueDate={dueDate}
          setTaskTitle={setTitle}
          setTaskDescription={setDescription}
          setTaskDueDate={setDueDate}
          onSubmit={handleSubmitCreateTask}
          onCancel={handleCancelCreateTask}
        />

        <DeleteAllTasksDialog
          isDeleteAllOpen={isDeleteAllOpen}
          setIsDeleteAllOpen={setIsDeleteAllOpen}
          handleConfirmDeleteAllTasks={handleConfirmDeleteAllTasks}
        />

        <Button
          type="button"
          variant="destructive"
          className="flex-1 sm:w-32 sm:flex-none"
          onClick={() => setIsDeleteAllOpen(true)}
        >
          <Trash2 />
          Delete all
        </Button>
      </div>
    </div>
  )
}
