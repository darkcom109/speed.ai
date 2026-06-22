import type { ReactNode } from "react"

import type { Task } from "@/app/tasks/types"

type RenderTaskListProps = {
  tasks: Task[]
  emptyMessage: string
  renderTask: (task: Task) => ReactNode
}

export default function RenderTaskList({
  tasks,
  emptyMessage,
  renderTask,
}: RenderTaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="hidden grid-cols-[minmax(0,1fr)_12rem_6.5rem_4.5rem] items-center gap-4 border-b bg-muted/20 px-4 py-2 text-xs font-medium text-muted-foreground md:grid">
        <span>Task</span>
        <span>Due date</span>
        <span>Status</span>
        <span className="text-right">Actions</span>
      </div>

      <ul className="divide-y">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="group/task grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/20 sm:px-4 md:grid-cols-[minmax(0,1fr)_12rem_6.5rem_4.5rem] md:gap-4"
          >
            {renderTask(task)}
          </li>
        ))}
      </ul>
    </div>
  )
}
