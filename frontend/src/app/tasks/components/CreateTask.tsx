import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { type CreateTaskProps } from "../types/create-task-props"

export default function CreateTask(
    {
        handleCreateTask, 
        title, 
        description, 
        dueDate,
        setTitle,
        setDescription,
        setDueDate,
    }: CreateTaskProps) {
    return (
        <form
            onSubmit={handleCreateTask}
            className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row"
        >
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Task title"
              required
            />

            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
            />

            <Input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
            
            <Button type="submit" className="sm:w-28">
              Add task
            </Button>
        </form>
    )
}