import type { Dispatch, FormEvent, SetStateAction } from "react"

import ExpenseFormDialog from "@/app/expenses/components/ExpenseFormDialog"
import type { Expense, ExpenseKind } from "@/app/expenses/types/expense"
import { Button } from "@/components/ui/button"

type EditExpenseDialogProps = {
  expense: Expense
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  handleUpdateExpense: (event: FormEvent<HTMLFormElement>) => Promise<void>
  editTitle: string
  editAmount: string
  editKind: ExpenseKind
  editCategory: string
  editSpentAt: string
  setEditTitle: Dispatch<SetStateAction<string>>
  setEditAmount: Dispatch<SetStateAction<string>>
  setEditKind: Dispatch<SetStateAction<ExpenseKind>>
  setEditCategory: Dispatch<SetStateAction<string>>
  setEditSpentAt: Dispatch<SetStateAction<string>>
  setEditingExpenseId: Dispatch<SetStateAction<string | null>>
}

export default function EditExpenseDialog({
  expense,
  isOpen,
  onOpenChange,
  handleUpdateExpense,
  editTitle,
  editAmount,
  editKind,
  editCategory,
  editSpentAt,
  setEditTitle,
  setEditAmount,
  setEditKind,
  setEditCategory,
  setEditSpentAt,
  setEditingExpenseId,
}: EditExpenseDialogProps) {
  return (
    <ExpenseFormDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      trigger={
        <Button type="button" variant="outline" size="sm">
          Edit
        </Button>
      }
      title="Edit finance entry"
      description={`Update "${expense.title}".`}
      submitLabel="Save"
      expenseTitle={editTitle}
      expenseAmount={editAmount}
      expenseKind={editKind}
      expenseCategory={editCategory}
      expenseSpentAt={editSpentAt}
      setExpenseTitle={setEditTitle}
      setExpenseAmount={setEditAmount}
      setExpenseKind={setEditKind}
      setExpenseCategory={setEditCategory}
      setExpenseSpentAt={setEditSpentAt}
      onSubmit={handleUpdateExpense}
      onCancel={() => setEditingExpenseId(null)}
    />
  )
}
