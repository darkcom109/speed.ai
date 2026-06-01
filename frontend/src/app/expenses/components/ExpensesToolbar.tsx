import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react"
import { useRef, useState } from "react"
import {
  DownloadIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react"

import DeleteAllFinancesDialog from "@/app/expenses/components/DeleteAllFinancesDialog"
import ExpenseFormDialog from "@/app/expenses/components/ExpenseFormDialog"
import type { ExpenseKind } from "@/app/expenses/types/expense"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ExpensesToolbarProps = {
  handleCreateExpense: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleDeleteAllExpenses: () => Promise<void>
  onExportCsv: () => void
  onImportCsv: (file: File) => Promise<void>
  title: string
  amount: string
  kind: ExpenseKind
  category: string
  spentAt: string
  isCreating: boolean
  isImporting: boolean
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
  onExportCsv,
  onImportCsv,
  title,
  amount,
  kind,
  category,
  spentAt,
  isCreating,
  isImporting,
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
  const importInputRef = useRef<HTMLInputElement | null>(null)

  async function handleSubmitCreateExpense(event: FormEvent<HTMLFormElement>) {
    await handleCreateExpense(event)
    setIsCreateOpen(false)
  }

  async function handleConfirmDeleteAllFinances() {
    await handleDeleteAllExpenses()
    setIsDeleteAllOpen(false)
  }

  async function handleImportCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    await onImportCsv(file)
    event.target.value = ""
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 lg:flex-row">
      <Input
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search finances..."
      />

      <Button
        type="button"
        variant="outline"
        onClick={onExportCsv}
      >
        <DownloadIcon />
      </Button>

      <input
        ref={importInputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={handleImportCsv}
      />

      <Button
        type="button"
        variant="outline"
        className="shrink-0 lg:w-36"
        disabled={isImporting}
        onClick={() => importInputRef.current?.click()}
      >
        <UploadIcon />
        {isImporting ? "Importing" : "Import CSV"}
      </Button>

      <ExpenseFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        trigger={
          <Button type="button" className="lg:w-20" disabled={isCreating}>
            <PlusIcon />
            Add
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
        className="shrink-0 lg:w-32"
        onClick={() => setIsDeleteAllOpen(true)}
      >
        <Trash2Icon />
        Delete all
      </Button>
    </div>
  )
}
