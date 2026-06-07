import type { CreateSavingAccountPayload } from "@/app/expenses/types/create-saving-account-payload"
import type { SavingAccount } from "@/app/expenses/types/saving-account"
import type { UpdateSavingAccountPayload } from "@/app/expenses/types/update-saving-account-payload"

export async function getSavingAccounts(): Promise<SavingAccount[]> {
  const response = await fetch("http://localhost:3001/api/savings", {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to load saving accounts")
  }

  return data.savingAccounts
}

export async function createSavingAccount(
  payload: CreateSavingAccountPayload
): Promise<SavingAccount> {
  const response = await fetch("http://localhost:3001/api/savings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to create saving account")
  }

  return data.savingAccount
}

export async function updateSavingAccount(
  savingAccountId: string,
  payload: UpdateSavingAccountPayload
): Promise<SavingAccount> {
  const response = await fetch(`http://localhost:3001/api/savings/${savingAccountId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to update saving account")
  }

  return data.savingAccount
}

export async function deleteSavingAccount(savingAccountId: string): Promise<void> {
  const response = await fetch(`http://localhost:3001/api/savings/${savingAccountId}`, {
    method: "DELETE",
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to delete saving account")
  }
}
