import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type TaskFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactNode
  title: string
  description: string
  submitLabel: string
  taskTitle: string
  taskDescription: string
  taskDueDate: string
  setTaskTitle: Dispatch<SetStateAction<string>>
  setTaskDescription: Dispatch<SetStateAction<string>>
  setTaskDueDate: Dispatch<SetStateAction<string>>
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onCancel: () => void
}

export default function TaskFormDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  submitLabel,
  taskTitle,
  taskDescription,
  taskDueDate,
  setTaskTitle,
  setTaskDescription,
  setTaskDueDate,
  onSubmit,
  onCancel,
}: TaskFormDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 grid w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <div>
            <DialogPrimitive.Title className="font-heading text-base font-medium">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          </div>

          <form onSubmit={onSubmit} className="grid gap-3">
            <Input
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Task title"
              required
            />
            <textarea
              value={taskDescription}
              onChange={(event) => setTaskDescription(event.target.value)}
              placeholder="Description"
              className="min-h-32 resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <Input
              type="datetime-local"
              value={taskDueDate}
              onChange={(event) => setTaskDueDate(event.target.value)}
              aria-label="Due date and time"
            />
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">{submitLabel}</Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
