import { TriangleAlertIcon } from "lucide-react"

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
} from "@/components/ui/alert-dialog"

type DeleteAllTasksDialogProps = {
  isDeleteAllOpen: boolean
  setIsDeleteAllOpen: React.Dispatch<React.SetStateAction<boolean>>
  handleConfirmDeleteAllTasks: () => void
}

export default function DeleteAllTasksDialog({
  isDeleteAllOpen,
  setIsDeleteAllOpen,
  handleConfirmDeleteAllTasks,
}: DeleteAllTasksDialogProps) {
  return (
    <AlertDialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlertIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete all tasks?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete every task in your account. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => void handleConfirmDeleteAllTasks()}
          >
            Delete all
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
