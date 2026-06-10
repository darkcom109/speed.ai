import { Trash2Icon, TriangleAlertIcon } from "lucide-react"

import type { Expense } from "@/app/expenses/types/expense"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type DeleteFinanceDialogProps = {
  finance: Expense
  onDelete: (financeId: string) => void | Promise<void>
}

export default function DeleteFinanceDialog({
  finance,
  onDelete,
}: DeleteFinanceDialogProps) {
  const entryLabel = finance.kind === "income" ? "income" : "expense"

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          aria-label={`Delete ${finance.title}`}
          title="Delete"
        >
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlertIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this finance entry?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the {entryLabel} entry "{finance.title}".
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => void onDelete(finance.id)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
