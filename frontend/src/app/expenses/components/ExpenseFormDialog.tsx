import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ExpenseKind } from "@/app/expenses/types/expense"

const categoryOptions: Record<ExpenseKind, string[]> = {
  expense: [
    "General",
    "Food",
    "Transport",
    "Bills",
    "Subscriptions",
    "Shopping",
    "Health",
    "Entertainment",
    "Work",
    "Other",
  ],
  income: [
    "Income",
    "Salary",
    "Freelance",
    "Refund",
    "Gift",
    "Investment",
    "Other",
  ],
}

const defaultCategory: Record<ExpenseKind, string> = {
  expense: "General",
  income: "Income",
}

type ExpenseFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactNode
  title: string
  description: string
  submitLabel: string
  expenseTitle: string
  expenseAmount: string
  expenseKind: ExpenseKind
  expenseCategory: string
  expenseSpentAt: string
  setExpenseTitle: Dispatch<SetStateAction<string>>
  setExpenseAmount: Dispatch<SetStateAction<string>>
  setExpenseKind: Dispatch<SetStateAction<ExpenseKind>>
  setExpenseCategory: Dispatch<SetStateAction<string>>
  setExpenseSpentAt: Dispatch<SetStateAction<string>>
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onCancel: () => void
}

export default function ExpenseFormDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  submitLabel,
  expenseTitle,
  expenseAmount,
  expenseKind,
  expenseCategory,
  expenseSpentAt,
  setExpenseTitle,
  setExpenseAmount,
  setExpenseKind,
  setExpenseCategory,
  setExpenseSpentAt,
  onSubmit,
  onCancel,
}: ExpenseFormDialogProps) {
  const selectedCategory = expenseCategory || defaultCategory[expenseKind]
  const currentCategoryOptions = categoryOptions[expenseKind].includes(
    selectedCategory
  )
    ? categoryOptions[expenseKind]
    : [...categoryOptions[expenseKind], selectedCategory]

  function handleKindChange(value: string) {
    const nextKind = value as ExpenseKind

    setExpenseKind(nextKind)
    setExpenseCategory(defaultCategory[nextKind])
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 grid w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <div>
            <DialogPrimitive.Title className="font-heading text-base font-medium">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          </div>

          <form onSubmit={onSubmit} className="grid gap-3">
            <Input
              value={expenseTitle}
              onChange={(event) => setExpenseTitle(event.target.value)}
              placeholder="Title"
              required
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={expenseAmount}
              onChange={(event) => setExpenseAmount(event.target.value)}
              placeholder="Amount"
              required
            />
            <Select
              value={expenseKind}
              onValueChange={handleKindChange}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Entry type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedCategory}
              onValueChange={setExpenseCategory}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {currentCategoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={expenseSpentAt}
              onChange={(event) => setExpenseSpentAt(event.target.value)}
            />
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">{submitLabel}</Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
