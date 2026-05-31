import type { CSSProperties, FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import {
  ReceiptTextIcon,
  TrendingUpIcon,
  Trash2Icon,
  WalletCardsIcon,
} from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "@/app/expenses/api/expenses-api"
import EditExpenseDialog from "@/app/expenses/components/EditExpenseDialog"
import ExpenseSpendingChart from "@/app/expenses/components/ExpenseSpendingChart"
import ExpensesToolbar from "@/app/expenses/components/ExpensesToolbar"
import type { Expense, ExpenseKind } from "@/app/expenses/types/expense"

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
})

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function getDateInputValue() {
  return new Date().toISOString().slice(0, 10)
}

function getExpenseDate(date: string) {
  return new Date(date)
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [kind, setKind] = useState<ExpenseKind>("expense")
  const [category, setCategory] = useState("General")
  const [spentAt, setSpentAt] = useState(getDateInputValue())
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [editKind, setEditKind] = useState<ExpenseKind>("expense")
  const [editCategory, setEditCategory] = useState("")
  const [editSpentAt, setEditSpentAt] = useState("")

  const totalSpent = useMemo(
    () =>
      expenses.reduce(
        (total, expense) =>
          expense.kind === "expense" ? total + expense.amount : total,
        0
      ),
    [expenses]
  )

  const totalPaidIn = useMemo(
    () =>
      expenses.reduce(
        (total, expense) =>
          expense.kind === "income" ? total + expense.amount : total,
        0
      ),
    [expenses]
  )

  const balance = totalPaidIn - totalSpent

  const filteredExpenses = expenses.filter((expense) => {
    const search = searchTerm.toLowerCase()

    return (
      expense.title.toLowerCase().includes(search) ||
      expense.category.toLowerCase().includes(search)
    )
  })

  useEffect(() => {
    async function loadExpenses() {
      try {
        setError("")
        const loadedExpenses = await getExpenses()

        setExpenses(loadedExpenses)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to load expenses")
      } finally {
        setIsLoading(false)
      }
    }

    loadExpenses()
  }, [])

  async function handleCreateExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setError("")
      setIsCreating(true)

      const expense = await createExpense({
        title,
        amount: Number(amount),
        kind,
        category: category || undefined,
        spentAt: spentAt ? new Date(`${spentAt}T00:00:00`).toISOString() : undefined,
      })

      setExpenses((currentExpenses) => [expense, ...currentExpenses])
      setTitle("")
      setAmount("")
      setKind("expense")
      setCategory("General")
      setSpentAt(getDateInputValue())
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to create expense")
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDeleteExpense(expenseId: string) {
    try {
      setError("")

      await deleteExpense(expenseId)

      setExpenses((currentExpenses) =>
        currentExpenses.filter((expense) => expense.id !== expenseId)
      )
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to delete expense")
    }
  }

  function startEditingExpense(expense: Expense) {
    setEditingExpenseId(expense.id)
    setEditTitle(expense.title)
    setEditAmount(String(expense.amount))
    setEditKind(expense.kind)
    setEditCategory(
      expense.category || (expense.kind === "income" ? "Paid in" : "General")
    )
    setEditSpentAt(expense.spentAt.slice(0, 10))
  }

  async function handleUpdateExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingExpenseId) {
      return
    }

    try {
      setError("")

      const expense = await updateExpense(editingExpenseId, {
        title: editTitle,
        amount: Number(editAmount),
        kind: editKind,
        category: editCategory || undefined,
        spentAt: editSpentAt
          ? new Date(`${editSpentAt}T00:00:00`).toISOString()
          : undefined,
      })

      setExpenses((currentExpenses) =>
        currentExpenses.map((currentExpense) =>
          currentExpense.id === expense.id ? expense : currentExpense
        )
      )

      setEditingExpenseId(null)
      setEditTitle("")
      setEditAmount("")
      setEditKind("expense")
      setEditCategory("General")
      setEditSpentAt("")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update expense")
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Finances" />

        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Finances</h2>
            <p className="text-sm text-muted-foreground">
              Track spending and money paid in across your workspace.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <WalletCardsIcon className="size-5" />
                </div>
                <div>
                  <CardTitle>{currencyFormatter.format(totalSpent)}</CardTitle>
                  <CardDescription>Total spent</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <TrendingUpIcon className="size-5" />
                </div>
                <div>
                  <CardTitle>{currencyFormatter.format(totalPaidIn)}</CardTitle>
                  <CardDescription>Paid in</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <ReceiptTextIcon className="size-5" />
                </div>
                <div>
                  <CardTitle>{currencyFormatter.format(balance)}</CardTitle>
                  <CardDescription>Balance</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>

          <ExpenseSpendingChart
            expenses={expenses}
            error={error}
            isLoading={isLoading}
          />

          <ExpensesToolbar
            handleCreateExpense={handleCreateExpense}
            title={title}
            amount={amount}
            kind={kind}
            category={category}
            spentAt={spentAt}
            isCreating={isCreating}
            setTitle={setTitle}
            setAmount={setAmount}
            setKind={setKind}
            setCategory={setCategory}
            setSpentAt={setSpentAt}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          <Card>
            <CardHeader>
              <CardTitle>Recent transactions</CardTitle>
              <CardDescription>
                Your latest finance records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <p className="text-sm text-muted-foreground">
                  Loading expenses...
                </p>
              )}

              {!isLoading && filteredExpenses.length === 0 && (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  {searchTerm ? "No expenses match your search." : "No expenses added yet."}
                </div>
              )}

              {filteredExpenses.length > 0 && (
                <div className="divide-y rounded-lg border">
                  {filteredExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <ReceiptTextIcon className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{expense.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {expense.kind === "income" ? "Paid in" : "Expense"} -{" "}
                            {expense.category || "General"} -{" "}
                            {dateFormatter.format(getExpenseDate(expense.spentAt))}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <p
                          className={
                            expense.kind === "income"
                              ? "font-semibold text-emerald-500"
                              : "font-semibold"
                          }
                        >
                          {expense.kind === "income" ? "+" : "-"}
                          {currencyFormatter.format(expense.amount)}
                        </p>
                        <EditExpenseDialog
                          expense={expense}
                          isOpen={editingExpenseId === expense.id}
                          onOpenChange={(open) => {
                            if (open) {
                              startEditingExpense(expense)
                              return
                            }

                            setEditingExpenseId(null)
                          }}
                          handleUpdateExpense={handleUpdateExpense}
                          editTitle={editTitle}
                          editAmount={editAmount}
                          editKind={editKind}
                          editCategory={editCategory}
                          editSpentAt={editSpentAt}
                          setEditTitle={setEditTitle}
                          setEditAmount={setEditAmount}
                          setEditKind={setEditKind}
                          setEditCategory={setEditCategory}
                          setEditSpentAt={setEditSpentAt}
                          setEditingExpenseId={setEditingExpenseId}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteExpense(expense.id)}
                          aria-label={`Delete ${expense.title}`}
                        >
                          <Trash2Icon className="text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
