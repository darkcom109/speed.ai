export type TaskFilter =
  | "all"
  | "due-today"
  | "overdue"
  | "next-7-days"
  | "no-date"

export type TasksToolbarProps = {
  handleCreateTask: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  handleDeleteAllTasks: () => Promise<void>
  title: string
  description: string
  dueDate: string
  setTitle: React.Dispatch<React.SetStateAction<string>>
  setDescription: React.Dispatch<React.SetStateAction<string>>
  setDueDate: React.Dispatch<React.SetStateAction<string>>
  searchTerm: string
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
  taskFilter: TaskFilter
  setTaskFilter: React.Dispatch<React.SetStateAction<TaskFilter>>
}
