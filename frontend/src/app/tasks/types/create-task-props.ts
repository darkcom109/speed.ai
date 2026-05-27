export type CreateTaskProps = {
    handleCreateTask: (event: React.FormEvent<HTMLFormElement>) => void
    title: string
    description: string
    dueDate: string
    setTitle: React.Dispatch<React.SetStateAction<string>>
    setDescription: React.Dispatch<React.SetStateAction<string>>
    setDueDate: React.Dispatch<React.SetStateAction<string>>
}