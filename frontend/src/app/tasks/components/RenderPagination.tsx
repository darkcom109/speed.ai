import { Button } from "@/components/ui/button"

type RenderPaginationProps = {
  currentPage: number
  pageCount: number
  totalTasks: number
  tasksPerPage: number
  onPageChange: (page: number) => void
}

export default function RenderPagination({
  currentPage,
  pageCount,
  totalTasks,
  tasksPerPage,
  onPageChange,
}: RenderPaginationProps) {
  if (totalTasks <= tasksPerPage) {
    return null
  }

  const firstVisibleTask = (currentPage - 1) * tasksPerPage + 1
  const lastVisibleTask = Math.min(currentPage * tasksPerPage, totalTasks)

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing {firstVisibleTask}-{lastVisibleTask} of {totalTasks}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
