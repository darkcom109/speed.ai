import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type UpdateTaskProps = {
    handleUpdateTask: (event: React.FormEvent<HTMLFormElement>) => void
    editTitle: string
    editDescription: string
    editDueDate: string
    setEditTitle: React.Dispatch<React.SetStateAction<string>>
    setEditDescription: React.Dispatch<React.SetStateAction<string>>
    setEditDueDate: React.Dispatch<React.SetStateAction<string>>
    setEditingTaskId: React.Dispatch<React.SetStateAction<string | null>>
}

export default function UpdateTask({
    handleUpdateTask,
    editTitle,
    editDescription,
    editDueDate,
    setEditTitle,
    setEditDescription,
    setEditDueDate,
    setEditingTaskId,
} : UpdateTaskProps) {
    return (
        <form
            onSubmit={handleUpdateTask}
            className="grid flex-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_10rem_auto]"
            >
            <div className="space-y-1">
                <Input
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                className="h-9"
                required
                />
            </div>
            <div className="space-y-1">
                <Input
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                className="h-9"
                placeholder="Description"
                />
            </div>
            <div className="space-y-1">
                <Input
                type="date"
                value={editDueDate}
                onChange={(event) => setEditDueDate(event.target.value)}
                className="h-9"
                />
            </div>
            <div className="flex gap-2 sm:justify-end">
                <Button type="submit" size="sm" className="h-9">
                Save
                </Button>
                <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => setEditingTaskId(null)}
                >
                Cancel
                </Button>
            </div>
        </form>
    )
}