import type { CSSProperties } from "react"
import {
  LandmarkIcon,
  PencilIcon,
  PiggyBankIcon,
  PlusIcon,
  TrendingUpIcon,
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
import { Input } from "@/components/ui/input"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import DeleteSavingAccountDialog from "@/app/expenses/components/DeleteSavingAccountDialog"
import RenderPagination from "@/app/expenses/components/RenderPagination"
import SavingAccountFormDialog from "@/app/expenses/components/SavingAccountFormDialog"
import SavingsGoalChart from "@/app/expenses/components/SavingsGoalChart"
import { useSavings } from "@/app/expenses/hooks/use-savings"
import { currencyFormatter } from "@/app/expenses/utils/expense-utils"

function getProgress(currentAmount: number, targetAmount: number | null) {
  if (!targetAmount) {
    return 0
  }

  return Math.min((currentAmount / targetAmount) * 100, 100)
}

export default function SavingsPage() {
  const {
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
    loadError,
    formError,
    pageError,
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
    setEditName,
    setEditCurrentAmount,
    setEditTargetAmount,
    setMovementAmount,
    setCurrentPage,
    openCreateSavingAccountDialog,
    closeCreateSavingAccountDialog,
    handleCreateSavingAccount,
    handleUpdateSavingAccount,
    handleDeleteSavingAccount,
    startEditingSavingAccount,
    stopEditingSavingAccount,
    handleMoveSavings,
  } = useSavings()

  function renderPagination() {
    if (!shouldShowPagination) {
      return null
    }

    return (
      <RenderPagination
        firstVisibleEntry={firstVisibleEntry}
        lastVisibleEntry={lastVisibleEntry}
        totalEntries={savingAccounts.length}
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
        <SiteHeader title="Savings" />

        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Savings</h2>
              <p className="text-sm text-muted-foreground">
                Track saving pots, balances, and goals.
              </p>
            </div>

            <SavingAccountFormDialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => {
                if (open) {
                  openCreateSavingAccountDialog()
                  return
                }

                closeCreateSavingAccountDialog()
              }}
              trigger={
                <Button type="button">
                  <PlusIcon />
                  Add account
                </Button>
              }
              title="Add saving account"
              description="Create a pot for emergency funds, holidays, deposits, or anything else."
              submitLabel="Add account"
              name={name}
              currentAmount={currentAmount}
              targetAmount={targetAmount}
              setName={setName}
              setCurrentAmount={setCurrentAmount}
              setTargetAmount={setTargetAmount}
              onSubmit={handleCreateSavingAccount}
              onCancel={closeCreateSavingAccountDialog}
              error={formError}
              isSubmitting={isCreating}
            />
          </div>

          {(loadError || pageError) && (
            <p className="text-sm text-destructive">
              {loadError || pageError}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <PiggyBankIcon className="size-5" />
                </div>
                <div>
                  <CardTitle>{currencyFormatter.format(totalSaved)}</CardTitle>
                  <CardDescription>Total saved</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <TrendingUpIcon className="size-5" />
                </div>
                <div>
                  <CardTitle>{currencyFormatter.format(totalTarget)}</CardTitle>
                  <CardDescription>Total target</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <LandmarkIcon className="size-5" />
                </div>
                <div>
                  <CardTitle>{currencyFormatter.format(remainingTarget)}</CardTitle>
                  <CardDescription>Left to save</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>

          <SavingsGoalChart
            savingAccounts={savingAccounts}
            error={loadError}
            isLoading={isLoading}
          />

          {totalTarget > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Overall progress</CardTitle>
                <CardDescription>
                  {Math.round(overallProgress)}% of your savings targets reached.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Saving accounts</CardTitle>
              <CardDescription>
                Move money in and out of each pot as your balances change.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading && (
                <p className="text-sm text-muted-foreground">
                  Loading saving accounts...
                </p>
              )}

              {!isLoading && savingAccounts.length === 0 && (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  No saving accounts added yet.
                </div>
              )}

              {paginatedSavingAccounts.map((savingAccount) => {
                const progress = getProgress(
                  savingAccount.currentAmount,
                  savingAccount.targetAmount
                )

                return (
                  <div
                    key={savingAccount.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">
                            {savingAccount.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {savingAccount.targetAmount
                              ? `${currencyFormatter.format(savingAccount.currentAmount)} of ${currencyFormatter.format(savingAccount.targetAmount)}`
                              : `${currencyFormatter.format(savingAccount.currentAmount)} saved`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <SavingAccountFormDialog
                            open={editingSavingAccountId === savingAccount.id}
                            onOpenChange={(open) => {
                              if (open) {
                                startEditingSavingAccount(savingAccount)
                                return
                              }

                              stopEditingSavingAccount()
                            }}
                            trigger={
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                              >
                                <PencilIcon />
                                Edit
                              </Button>
                            }
                            title="Edit saving account"
                            description={`Update "${savingAccount.name}".`}
                            submitLabel="Save"
                            name={editName}
                            currentAmount={editCurrentAmount}
                            targetAmount={editTargetAmount}
                            setName={setEditName}
                            setCurrentAmount={setEditCurrentAmount}
                            setTargetAmount={setEditTargetAmount}
                            onSubmit={handleUpdateSavingAccount}
                            onCancel={stopEditingSavingAccount}
                            error={formError}
                          />
                          <DeleteSavingAccountDialog
                            savingAccount={savingAccount}
                            onDelete={handleDeleteSavingAccount}
                          />
                        </div>
                      </div>

                      {savingAccount.targetAmount ? (
                        (
                          <div className="space-y-2">
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(progress)}% complete
                            </p>
                          </div>
                        )
                      ) : (<p></p>)}

                      <div className="grid gap-2 md:grid-cols-[10rem_auto_auto]">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={movementAmounts[savingAccount.id] || ""}
                          onChange={(event) =>
                            setMovementAmount(savingAccount.id, event.target.value)
                          }
                          placeholder="Amount"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleMoveSavings(savingAccount, "deposit")}
                        >
                          Deposit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleMoveSavings(savingAccount, "withdraw")}
                        >
                          Withdraw
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {renderPagination()}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
