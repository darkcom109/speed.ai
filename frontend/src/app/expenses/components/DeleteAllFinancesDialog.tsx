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

type DeleteAllFinancesDialogProps = {
  isDeleteAllOpen: boolean
  setIsDeleteAllOpen: React.Dispatch<React.SetStateAction<boolean>>
  handleConfirmDeleteAllFinances: () => void
}

export default function DeleteAllFinancesDialog({
  isDeleteAllOpen,
  setIsDeleteAllOpen,
  handleConfirmDeleteAllFinances,
}: DeleteAllFinancesDialogProps) {
  return (
    <AlertDialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlertIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete all finances?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete every finance entry in your account.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => void handleConfirmDeleteAllFinances()}
          >
            Delete all
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
