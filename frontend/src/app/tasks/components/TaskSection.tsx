import type { ReactNode } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import RenderPagination from "@/app/tasks/components/RenderPagination"
import RenderTaskList from "@/app/tasks/components/RenderTaskList"
import type { Task } from "@/app/tasks/types"

type TaskSectionProps = {
  activeTasks: Task[]
  completedTasks: Task[]
  paginatedActiveTasks: Task[]
  paginatedCompletedTasks: Task[]
  activePage: number
  completedPage: number
  activePageCount: number
  completedPageCount: number
  tasksPerPage: number
  onActivePageChange: (page: number) => void
  onCompletedPageChange: (page: number) => void
  renderTask: (task: Task) => ReactNode
}

export default function TaskSection({
  activeTasks,
  completedTasks,
  paginatedActiveTasks,
  paginatedCompletedTasks,
  activePage,
  completedPage,
  activePageCount,
  completedPageCount,
  tasksPerPage,
  onActivePageChange,
  onCompletedPageChange,
  renderTask,
}: TaskSectionProps) {
  return (
    <Tabs defaultValue="current" className="gap-4">
      <TabsList className="h-10 w-full justify-start rounded-lg bg-card p-1 sm:w-fit">
        <TabsTrigger value="current">
          Current ({activeTasks.length})
        </TabsTrigger>
        <TabsTrigger value="marked">
          Marked ({completedTasks.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="current" className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Current tasks</h3>
          <p className="text-xs text-muted-foreground">
            Tasks that still need attention.
          </p>
        </div>
        <RenderTaskList
          tasks={paginatedActiveTasks}
          emptyMessage="No current tasks found."
          renderTask={renderTask}
        />
        <RenderPagination
          currentPage={activePage}
          pageCount={activePageCount}
          totalTasks={activeTasks.length}
          tasksPerPage={tasksPerPage}
          onPageChange={onActivePageChange}
        />
      </TabsContent>

      <TabsContent value="marked" className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Marked tasks</h3>
          <p className="text-xs text-muted-foreground">
            Tasks you have marked as done.
          </p>
        </div>
        <RenderTaskList
          tasks={paginatedCompletedTasks}
          emptyMessage="No marked tasks found."
          renderTask={renderTask}
        />
        <RenderPagination
          currentPage={completedPage}
          pageCount={completedPageCount}
          totalTasks={completedTasks.length}
          tasksPerPage={tasksPerPage}
          onPageChange={onCompletedPageChange}
        />
      </TabsContent>
    </Tabs>
  )
}
