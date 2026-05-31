import type { Dispatch, FormEvent, SetStateAction } from "react"
import { useState } from "react"
import { PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"

import DeleteAllFinancesDialog from "@/app/expenses/components/DeleteAllFinancesDialog"
import ExpenseFormDialog from "@/app/expenses/components/ExpenseFormDialog"
import type { ExpenseKind } from "@/app/expenses/types/expense"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ExpensesToolbarProps = {
  handleCreateExpense: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleDeleteAllExpenses: () => Promise<void>
  title: string
  amount: string
  kind: ExpenseKind
  category: string
  spentAt: string
  isCreating: boolean
  setTitle: Dispatch<SetStateAction<string>>
  setAmount: Dispatch<SetStateAction<string>>
  setKind: Dispatch<SetStateAction<ExpenseKind>>
  setCategory: Dispatch<SetStateAction<string>>
  setSpentAt: Dispatch<SetStateAction<string>>
  searchTerm: string
  setSearchTerm: Dispatch<SetStateAction<string>>
}

export default function ExpensesToolbar({
  handleCreateExpense,
  handleDeleteAllExpenses,
  title,
  amount,
  kind,
  category,
  spentAt,
  isCreating,
  setTitle,
  setAmount,
  setKind,
  setCategory,
  setSpentAt,
  searchTerm,
  setSearchTerm,
}: ExpensesToolbarProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false)

  async function handleSubmitCreateExpense(event: FormEvent<HTMLFormElement>) {
    await handleCreateExpense(event)
    setIsCreateOpen(false)
  }

  async function handleConfirmDeleteAllFinances() {
    await handleDeleteAllExpenses()
    setIsDeleteAllOpen(false)
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 lg:flex-row">
      <Input
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search finances..."
      />
      <Button type="submit" variant="outline" className="shrink-0">
        <SearchIcon />
      </Button>

      <ExpenseFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        trigger={
          <Button type="button" className="lg:w-36" disabled={isCreating}>
            <PlusIcon />
            Add entry
          </Button>
        }
        title="Add Finance Entry"
        description="Create a new expense or income entry."
        submitLabel="Add entry"
        expenseTitle={title}
        expenseAmount={amount}
        expenseKind={kind}
        expenseCategory={category}
        expenseSpentAt={spentAt}
        setExpenseTitle={setTitle}
        setExpenseAmount={setAmount}
        setExpenseKind={setKind}
        setExpenseCategory={setCategory}
        setExpenseSpentAt={setSpentAt}
        onSubmit={handleSubmitCreateExpense}
        onCancel={() => setIsCreateOpen(false)}
      />

      <DeleteAllFinancesDialog
        isDeleteAllOpen={isDeleteAllOpen}
        setIsDeleteAllOpen={setIsDeleteAllOpen}
        handleConfirmDeleteAllFinances={handleConfirmDeleteAllFinances}
      />

      <Button
        type="button"
        variant="destructive"
        className="shrink-0 lg:w-40"
        onClick={() => setIsDeleteAllOpen(true)}
      >
        <Trash2Icon />
        Delete all
      </Button>
    </div>
  )
}
