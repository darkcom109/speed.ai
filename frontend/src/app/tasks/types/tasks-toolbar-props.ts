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
}
