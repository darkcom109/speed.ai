import { Button } from "@/components/ui/button"
import { type RenderPaginationProps } from "../types/render-pagination"

export default function RenderPagination({
    firstVisibleEntry,
    lastVisibleEntry,
    filteredExpenses,
    currentPage,
    setCurrentPage,
    pageCount
} : RenderPaginationProps) {
    return (
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
                Showing {firstVisibleEntry}-{lastVisibleEntry} of{" "}
                {filteredExpenses.length}
                </p>
                <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
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
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pageCount}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}