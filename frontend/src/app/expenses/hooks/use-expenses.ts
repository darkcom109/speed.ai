import { useCallback, useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"

import {
  createExpense,
  deleteAllExpenses,
  deleteExpense,
  getExpenses,
  importExpenses,
  updateExpense,
} from "@/app/expenses/api/expenses-api"
import type { Expense, ExpenseKind } from "@/app/expenses/types/expense"
import { parseFinancesCsv } from "@/app/expenses/utils/import-finances-csv"

const financeEntriesPerPage = 10

function getDateInputValue() {
  return getDateInputValueFromDate(new Date())
}

function getDateInputValueFromDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function getStoredDateValue(date: string) {
  return `${date}T12:00:00.000Z`
}

function getPageCount(totalEntries: number) {
  return Math.max(1, Math.ceil(totalEntries / financeEntriesPerPage))
}

function getPaginatedExpenses(expenses: Expense[], page: number) {
  const start = (page - 1) * financeEntriesPerPage

  return expenses.slice(start, start + financeEntriesPerPage)
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [kind, setKind] = useState<ExpenseKind>("expense")
  const [category, setCategory] = useState("General")
  const [spentAt, setSpentAt] = useState(getDateInputValue())
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
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

  const totalIncome = useMemo(
    () =>
      expenses.reduce(
        (total, expense) =>
          expense.kind === "income" ? total + expense.amount : total,
        0
      ),
    [expenses]
  )

  const balance = totalIncome - totalSpent

  const filteredExpenses = expenses.filter((expense) => {
    const search = searchTerm.toLowerCase()

    return (
      expense.title.toLowerCase().includes(search) ||
      expense.category.toLowerCase().includes(search)
    )
  })
  const pageCount = getPageCount(filteredExpenses.length)
  const paginatedExpenses = getPaginatedExpenses(filteredExpenses, currentPage)
  const shouldShowPagination = filteredExpenses.length > financeEntriesPerPage
  const firstVisibleEntry = (currentPage - 1) * financeEntriesPerPage + 1
  const lastVisibleEntry = Math.min(
    currentPage * financeEntriesPerPage,
    filteredExpenses.length
  )

  const loadExpenses = useCallback(async () => {
    try {
      setError("")
      const loadedExpenses = await getExpenses()

      setExpenses(loadedExpenses)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load expenses")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadExpenses()
  }, [loadExpenses])

  useEffect(() => {
    function handleFinancesUpdated() {
      void loadExpenses()
    }

    window.addEventListener("finances-updated", handleFinancesUpdated)

    return () => {
      window.removeEventListener("finances-updated", handleFinancesUpdated)
    }
  }, [loadExpenses])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount)
    }
  }, [currentPage, pageCount])

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
        spentAt: spentAt
          ? getStoredDateValue(spentAt)
          : undefined,
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

  async function handleDeleteAllExpenses() {
    try {
      setError("")

      await deleteAllExpenses()
      setExpenses([])
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to delete all finances")
    }
  }

  async function handleImportExpenses(file: File) {
    try {
      setError("")
      setIsImporting(true)

      const financeEntries = await parseFinancesCsv(file)

      await importExpenses(financeEntries)
      await loadExpenses()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to import finances")
    } finally {
      setIsImporting(false)
    }
  }

  function startEditingExpense(expense: Expense) {
    setEditingExpenseId(expense.id)
    setEditTitle(expense.title)
    setEditAmount(String(expense.amount))
    setEditKind(expense.kind)
    setEditCategory(
      expense.category || (expense.kind === "income" ? "Income" : "General")
    )
    setEditSpentAt(getDateInputValueFromDate(new Date(expense.spentAt)))
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
          ? getStoredDateValue(editSpentAt)
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

  return {
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
  }
}
