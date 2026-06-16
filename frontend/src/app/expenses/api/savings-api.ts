import type { CreateSavingAccountPayload } from "@/app/expenses/types/create-saving-account-payload"
import type { SavingAccount } from "@/app/expenses/types/saving-account"
import type { UpdateSavingAccountPayload } from "@/app/expenses/types/update-saving-account-payload"
import { apiClient } from "@/lib/api-client"

export async function getSavingAccounts(): Promise<SavingAccount[]> {
  const { data } = await apiClient.get<{ savingAccounts: SavingAccount[] }>("/savings")

  return data.savingAccounts
}

export async function createSavingAccount(
  payload: CreateSavingAccountPayload
): Promise<SavingAccount> {
  const { data } = await apiClient.post<{ savingAccount: SavingAccount}>("/savings", payload)

  return data.savingAccount
}

export async function updateSavingAccount(
  savingAccountId: string,
  payload: UpdateSavingAccountPayload
): Promise<SavingAccount> {
  const { data } = await apiClient.patch<{ savingAccount: SavingAccount}>(`/savings/${savingAccountId}`, payload)

  return data.savingAccount
}

export async function deleteSavingAccount(savingAccountId: string): Promise<void> {
  await apiClient.delete(`/savings/${savingAccountId}`)
}
