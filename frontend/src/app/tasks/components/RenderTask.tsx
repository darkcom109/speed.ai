import { Button } from "@/components/ui/button"
import { type Task } from "@/app/tasks/types/task"

export type RenderTaskProps = {
    task: Task
    startEditingTask: (task: Task) => void
    handleToggleTask: (task: Task) => void
    handleDeleteTask: (taskId: string) => void
}

export default function RenderTask({
    task,
    startEditingTask,
    handleToggleTask,
    handleDeleteTask
} : RenderTaskProps) {
    return (
        <>
            <div>
                <p
                    className={
                        task.completed
                        ? "font-medium text-muted-foreground line-through"
                        : "font-medium"
                    }
                    >
                    {task.title}
                </p>
                    {task.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {task.description}
                    </p>
                    )}
                    {task.dueDate && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                )}
            </div>

            <div className="flex shrink-0 gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => startEditingTask(task)}
                >
                    Edit
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleTask(task)}
                >
                    {task.completed ? "Mark Undone" : "Mark done"}
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                >
                    Delete
                </Button>
            </div>
        </>
    )
}