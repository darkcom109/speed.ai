import { useCallback, useEffect, useState } from "react"

import { getExpenses } from "@/app/expenses/api/expenses-api"
import { getSavingAccounts } from "@/app/expenses/api/savings-api"
import type { NoteReferenceType } from "@/app/notes/extensions/live-note-reference"
import { getTasks } from "@/app/tasks/api/tasks-api"

export type NoteReferenceValues = Record<NoteReferenceType, string>

const unavailableReferences: NoteReferenceValues = {
  "savings-total": "Savings: unavailable",
  "monthly-spend": "Spent this month: unavailable",
  "monthly-balance": "Balance this month: unavailable",
  "tasks-due-today": "Tasks due today: unavailable",
  "open-tasks": "Open tasks: unavailable",
}

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
})

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
}

export function useNoteReferences() {
  const [references, setReferences] = useState<NoteReferenceValues>(
    unavailableReferences
  )
  const [isLoading, setIsLoading] = useState(true)

  const loadReferences = useCallback(async () => {
    setIsLoading(true)

    try {
      const [tasks, finances, savingAccounts] = await Promise.all([
        getTasks(),
        getExpenses(),
        getSavingAccounts(),
      ])
      const now = new Date()
      const currentMonthFinances = finances.filter((finance) => {
        const spentAt = new Date(finance.spentAt)

        return (
          spentAt.getFullYear() === now.getFullYear() &&
          spentAt.getMonth() === now.getMonth()
        )
      })
      const monthlyIncome = currentMonthFinances.reduce(
        (total, finance) =>
          finance.kind === "income" ? total + finance.amount : total,
        0
      )
      const monthlySpend = currentMonthFinances.reduce(
        (total, finance) =>
          finance.kind === "expense" ? total + finance.amount : total,
        0
      )
      const totalSavings = savingAccounts.reduce(
        (total, account) => total + account.currentAmount,
        0
      )
      const tasksDueToday = tasks.filter(
        (task) =>
          !task.completed &&
          task.dueDate &&
          isSameDay(new Date(task.dueDate), now)
      ).length
      const openTasks = tasks.filter((task) => !task.completed).length

      setReferences({
        "savings-total": `Savings: ${currencyFormatter.format(totalSavings)}`,
        "monthly-spend": `Spent this month: ${currencyFormatter.format(monthlySpend)}`,
        "monthly-balance": `Balance this month: ${currencyFormatter.format(
          monthlyIncome - monthlySpend
        )}`,
        "tasks-due-today": `Tasks due today: ${tasksDueToday}`,
        "open-tasks": `Open tasks: ${openTasks}`,
      })
    } catch {
      setReferences(unavailableReferences)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    async function loadInitialReferences() {
      await loadReferences()
    }

    void loadInitialReferences()
  }, [loadReferences])

  useEffect(() => {
    function refreshReferences() {
      void loadReferences()
    }

    window.addEventListener("tasks-updated", refreshReferences)
    window.addEventListener("finances-updated", refreshReferences)

    return () => {
      window.removeEventListener("tasks-updated", refreshReferences)
      window.removeEventListener("finances-updated", refreshReferences)
    }
  }, [loadReferences])

  return {
    references,
    isLoading,
    refreshReferences: loadReferences,
  }
}
