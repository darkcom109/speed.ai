import { describe, expect, it, vi } from "vitest"

import {
  deleteAllExpenses,
  deleteExpense,
  importExpenses,
} from "@/app/expenses/api/expenses-api"
import { apiClient } from "@/lib/api-client"

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

describe("expenses-api", () => {
  it("wraps imported expenses in the backend request shape", async () => {
    const expenses = [
      {
        title: "Train",
        amount: 12.5,
        kind: "expense" as const,
        category: "Transport",
      },
    ]

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { count: 1 },
    })

    await expect(importExpenses(expenses)).resolves.toBe(1)
    expect(apiClient.post).toHaveBeenCalledWith("/expenses/import", {
      expenses,
    })
  })

  it("waits for individual and bulk deletes", async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ data: {} })

    await deleteExpense("expense-1")
    await deleteAllExpenses()

    expect(apiClient.delete).toHaveBeenNthCalledWith(1, "/expenses/expense-1")
    expect(apiClient.delete).toHaveBeenNthCalledWith(2, "/expenses/delete_all")
  })
})
