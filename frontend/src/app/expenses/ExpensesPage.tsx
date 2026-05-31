import type { CSSProperties } from "react"
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
import EditExpenseDialog from "@/app/expenses/components/EditExpenseDialog"
import ExpenseSpendingChart from "@/app/expenses/components/ExpenseSpendingChart"
import ExpensesToolbar from "@/app/expenses/components/ExpensesToolbar"
import { useExpenses } from "@/app/expenses/hooks/use-expenses"

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
})

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function getExpenseDate(date: string) {
  return new Date(date)
}

export default function ExpensesPage() {
  const {
    expenses,
    title,
    amount,
    kind,
    category,
    spentAt,
    error,
    isLoading,
    isCreating,
    searchTerm,
    currentPage,
    editingExpenseId,
    editTitle,
    editAmount,
    editKind,
    editCategory,
    editSpentAt,
    totalSpent,
    totalIncome,
    balance,
    filteredExpenses,
    paginatedExpenses,
    pageCount,
    shouldShowPagination,
    firstVisibleEntry,
    lastVisibleEntry,
    setTitle,
    setAmount,
    setKind,
    setCategory,
    setSpentAt,
    setSearchTerm,
    setCurrentPage,
    setEditingExpenseId,
    setEditTitle,
    setEditAmount,
    setEditKind,
    setEditCategory,
    setEditSpentAt,
    handleCreateExpense,
    handleDeleteExpense,
    startEditingExpense,
    handleUpdateExpense,
  } = useExpenses()

  function renderPagination() {
    if (!shouldShowPagination) {
      return null
    }

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
              Track spending and income across your workspace.
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
                  <CardTitle>{currencyFormatter.format(totalIncome)}</CardTitle>
                  <CardDescription>Income</CardDescription>
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
            <CardContent className="space-y-3">
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

              {paginatedExpenses.length > 0 && (
                <div className="divide-y rounded-lg border">
                  {paginatedExpenses.map((expense) => (
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
                            {expense.kind === "income" ? "Income" : "Expense"} -{" "}
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

              {renderPagination()}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
