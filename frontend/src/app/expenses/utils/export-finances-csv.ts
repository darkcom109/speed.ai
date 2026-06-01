import type { Expense } from "@/app/expenses/types/expense"

function escapeCsvValue(value: string | number) {
  const stringValue = String(value)

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  return stringValue
}

function formatCsvDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toISOString().slice(0, 10)
}

export function exportFinancesCsv(expenses: Expense[]) {
  const headers = ["Title", "Amount", "Type", "Category", "Date"]

  const rows = expenses.map((expense) => [
    expense.title,
    expense.amount,
    expense.kind,
    expense.category,
    formatCsvDate(expense.spentAt),
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n")

  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8",
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = "finances.csv"
  link.click()

  URL.revokeObjectURL(url)
}
