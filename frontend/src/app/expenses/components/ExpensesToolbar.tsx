import type { Dispatch, FormEvent, SetStateAction } from "react"
import { useState } from "react"
import { PlusIcon, SearchIcon } from "lucide-react"

import ExpenseFormDialog from "@/app/expenses/components/ExpenseFormDialog"
import type { ExpenseKind } from "@/app/expenses/types/expense"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ExpensesToolbarProps = {
  handleCreateExpense: (event: FormEvent<HTMLFormElement>) => Promise<void>
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
  const [draftSearchTerm, setDraftSearchTerm] = useState(searchTerm)

  async function handleSubmitCreateExpense(event: FormEvent<HTMLFormElement>) {
    await handleCreateExpense(event)
    setIsCreateOpen(false)
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearchTerm(draftSearchTerm)
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 lg:flex-row">
      <form className="flex flex-1 gap-2" onSubmit={handleSearch}>
        <Input
          value={draftSearchTerm}
          onChange={(event) => setDraftSearchTerm(event.target.value)}
          placeholder="Search finances..."
        />
        <Button type="submit" variant="outline" className="shrink-0">
          <SearchIcon />
          Search
        </Button>
      </form>

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
        description="Create a new expense or paid-in entry."
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
    </div>
  )
}
