import { useCallback, useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"

import {
  createSavingAccount,
  deleteSavingAccount,
  getSavingAccounts,
  updateSavingAccount,
} from "@/app/expenses/api/savings-api"
import type { SavingAccount } from "@/app/expenses/types/saving-account"

const savingAccountsPerPage = 6

function getSavingsTotal(savingAccounts: SavingAccount[]) {
  return savingAccounts.reduce((total, savingAccount) => {
    return total + savingAccount.currentAmount
  }, 0)
}

function getSavingsTarget(savingAccounts: SavingAccount[]) {
  return savingAccounts.reduce((total, savingAccount) => {
    return total + (savingAccount.targetAmount || 0)
  }, 0)
}

function getPageCount(totalAccounts: number) {
  return Math.max(1, Math.ceil(totalAccounts / savingAccountsPerPage))
}

function getPaginatedSavingAccounts(savingAccounts: SavingAccount[], page: number) {
  const start = (page - 1) * savingAccountsPerPage

  return savingAccounts.slice(start, start + savingAccountsPerPage)
}

export function useSavings() {
  const [savingAccounts, setSavingAccounts] = useState<SavingAccount[]>([])
  const [name, setName] = useState("")
  const [currentAmount, setCurrentAmount] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingSavingAccountId, setEditingSavingAccountId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editCurrentAmount, setEditCurrentAmount] = useState("")
  const [editTargetAmount, setEditTargetAmount] = useState("")
  const [movementAmounts, setMovementAmounts] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const totalSaved = useMemo(() => getSavingsTotal(savingAccounts), [savingAccounts])
  const totalTarget = useMemo(() => getSavingsTarget(savingAccounts), [savingAccounts])
  const remainingTarget = Math.max(totalTarget - totalSaved, 0)
  const overallProgress = totalTarget > 0
    ? Math.min((totalSaved / totalTarget) * 100, 100)
    : 0
  const pageCount = getPageCount(savingAccounts.length)
  const visiblePage = Math.min(currentPage, pageCount)
  const paginatedSavingAccounts = getPaginatedSavingAccounts(
    savingAccounts,
    visiblePage
  )
  const shouldShowPagination = savingAccounts.length > savingAccountsPerPage
  const firstVisibleEntry = (visiblePage - 1) * savingAccountsPerPage + 1
  const lastVisibleEntry = Math.min(
    visiblePage * savingAccountsPerPage,
    savingAccounts.length
  )

  const loadSavingAccounts = useCallback(async () => {
    try {
      setError("")

      const loadedSavingAccounts = await getSavingAccounts()

      setSavingAccounts(loadedSavingAccounts)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load saving accounts")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    async function loadInitialSavingAccounts() {
      await loadSavingAccounts()
    }

    void loadInitialSavingAccounts()
  }, [loadSavingAccounts])

  async function handleCreateSavingAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setError("")
      setIsCreating(true)

      const savingAccount = await createSavingAccount({
        name,
        currentAmount: currentAmount ? Number(currentAmount) : undefined,
        targetAmount: targetAmount ? Number(targetAmount) : undefined,
      })

      setSavingAccounts((currentSavingAccounts) => [
        savingAccount,
        ...currentSavingAccounts,
      ])
      setName("")
      setCurrentAmount("")
      setTargetAmount("")
      setIsCreateDialogOpen(false)
      setCurrentPage(1)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to create saving account")
    } finally {
      setIsCreating(false)
    }
  }

  function startEditingSavingAccount(savingAccount: SavingAccount) {
    setEditingSavingAccountId(savingAccount.id)
    setEditName(savingAccount.name)
    setEditCurrentAmount(String(savingAccount.currentAmount))
    setEditTargetAmount(
      savingAccount.targetAmount === null ? "" : String(savingAccount.targetAmount)
    )
  }

  function stopEditingSavingAccount() {
    setEditingSavingAccountId(null)
    setEditName("")
    setEditCurrentAmount("")
    setEditTargetAmount("")
  }

  async function handleUpdateSavingAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingSavingAccountId) {
      return
    }

    try {
      setError("")

      const savingAccount = await updateSavingAccount(editingSavingAccountId, {
        name: editName,
        currentAmount: Number(editCurrentAmount),
        targetAmount: editTargetAmount ? Number(editTargetAmount) : null,
      })

      setSavingAccounts((currentSavingAccounts) =>
        currentSavingAccounts.map((currentSavingAccount) =>
          currentSavingAccount.id === savingAccount.id
            ? savingAccount
            : currentSavingAccount
        )
      )
      stopEditingSavingAccount()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update saving account")
    }
  }

  async function handleDeleteSavingAccount(savingAccountId: string) {
    try {
      setError("")

      await deleteSavingAccount(savingAccountId)

      setSavingAccounts((currentSavingAccounts) => {
        const nextSavingAccounts = currentSavingAccounts.filter(
          (savingAccount) => savingAccount.id !== savingAccountId
        )

        setCurrentPage((currentPage) =>
          Math.min(currentPage, getPageCount(nextSavingAccounts.length))
        )

        return nextSavingAccounts
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to delete saving account")
    }
  }

  function setMovementAmount(savingAccountId: string, amount: string) {
    setMovementAmounts((currentMovementAmounts) => ({
      ...currentMovementAmounts,
      [savingAccountId]: amount,
    }))
  }

  async function handleMoveSavings(
    savingAccount: SavingAccount,
    direction: "deposit" | "withdraw"
  ) {
    const amount = Number(movementAmounts[savingAccount.id] || 0)

    if (amount <= 0) {
      return
    }

    const nextAmount = direction === "deposit"
      ? savingAccount.currentAmount + amount
      : savingAccount.currentAmount - amount

    if (nextAmount < 0) {
      setError("You cannot withdraw more than the current balance")
      return
    }

    try {
      setError("")

      const updatedSavingAccount = await updateSavingAccount(savingAccount.id, {
        currentAmount: nextAmount,
      })

      setSavingAccounts((currentSavingAccounts) =>
        currentSavingAccounts.map((currentSavingAccount) =>
          currentSavingAccount.id === updatedSavingAccount.id
            ? updatedSavingAccount
            : currentSavingAccount
        )
      )
      setMovementAmount(savingAccount.id, "")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update saving balance")
    }
  }

  return {
    savingAccounts,
    name,
    currentAmount,
    targetAmount,
    isCreateDialogOpen,
    editingSavingAccountId,
    editName,
    editCurrentAmount,
    editTargetAmount,
    movementAmounts,
    currentPage,
    error,
    isLoading,
    isCreating,
    totalSaved,
    totalTarget,
    remainingTarget,
    overallProgress,
    paginatedSavingAccounts,
    pageCount,
    shouldShowPagination,
    firstVisibleEntry,
    lastVisibleEntry,
    setName,
    setCurrentAmount,
    setTargetAmount,
    setIsCreateDialogOpen,
    setEditName,
    setEditCurrentAmount,
    setEditTargetAmount,
    setMovementAmount,
    setCurrentPage,
    handleCreateSavingAccount,
    handleUpdateSavingAccount,
    handleDeleteSavingAccount,
    startEditingSavingAccount,
    stopEditingSavingAccount,
    handleMoveSavings,
  }
}
