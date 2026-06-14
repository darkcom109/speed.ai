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
    <ul className="divide-y rounded-lg border bg-card">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-start justify-between gap-3 p-3"
        >
          {renderTask(task)}
        </li>
      ))}
    </ul>
  )
}
