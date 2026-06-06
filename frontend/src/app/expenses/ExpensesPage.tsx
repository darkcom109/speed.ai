import type { CSSProperties } from "react"
import {
  ReceiptTextIcon,
  Trash2Icon,
} from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import EditExpenseDialog from "@/app/expenses/components/EditExpenseDialog"
import ExpenseSpendingChart from "@/app/expenses/components/ExpenseSpendingChart"
import ExpensesToolbar from "@/app/expenses/components/ExpensesToolbar"
import { useExpenses } from "@/app/expenses/hooks/use-expenses"
import RenderPagination from "@/app/expenses/components/RenderPagination"

// Export to CSV related imports
import { exportFinancesCsv } from "@/app/expenses/utils/export-finances-csv"
import { currencyFormatter, dateFormatter, getExpenseDate } from "./utils/expense-utils"
import ExpenseCards from "./components/ExpenseCards"
import ExpenseHeader from "./components/ExpenseHeader"

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
    isImporting,
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
    handleDeleteAllExpenses,
    handleImportExpenses,
    startEditingExpense,
    handleUpdateExpense,
  } = useExpenses()

  function renderPagination() {
    if (!shouldShowPagination) {
      return null
    }

    return (
      <RenderPagination 
        firstVisibleEntry={firstVisibleEntry}
        lastVisibleEntry={lastVisibleEntry}
        filteredExpenses={filteredExpenses}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageCount={pageCount}
      />
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

          <ExpenseCards 
            currencyFormatter={currencyFormatter}
            totalSpent={totalSpent}
            totalIncome={totalIncome}
            balance={balance}
          />

          <ExpenseSpendingChart
            expenses={expenses}
            error={error}
            isLoading={isLoading}
          />

          <ExpensesToolbar
            handleCreateExpense={handleCreateExpense}
            handleDeleteAllExpenses={handleDeleteAllExpenses}
            onExportCsv={() => exportFinancesCsv(filteredExpenses)}
            title={title}
            amount={amount}
            kind={kind}
            category={category}
            spentAt={spentAt}
            isCreating={isCreating}
            isImporting={isImporting}
            setTitle={setTitle}
            setAmount={setAmount}
            setKind={setKind}
            setCategory={setCategory}
            setSpentAt={setSpentAt}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onImportCsv={handleImportExpenses}
          />

          <Card>
            <ExpenseHeader />
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
